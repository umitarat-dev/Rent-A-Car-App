from rest_framework import serializers
from .models import Car, Reservation
from django.utils import timezone


class CarSerializer(serializers.ModelSerializer):

    is_available = serializers.BooleanField(
        default=True, # anonymous userlar için..
        read_only=True # 🎯 BURAYI EKLE: Yazma işlemlerinde (POST/PUT) bu alanı kullanma!
        )
    
    segment_display = serializers.CharField(source='get_segment_display', read_only=True) # segment field ının display halini segment_display field ında göstermek için. read_only=True yaparak segment_display field ının sadece okunabilir olduğunu belirtiyoruz. Yani bu field a veri gönderilemez, sadece görüntülenebilir.
    
    # Yakıt tipinin "Benzin", "Dizel" gibi görünmesi için:
    fuel_type_display = serializers.CharField(source='get_fuel_type_display', read_only=True)

    class Meta:
        model = Car
        fields = (
            'id',
            'plate_number',
            'brand',
            'model',
            'year',
            'gear',
            'segment',
            'segment_display',
            'rent_per_day',
            'availability',
            'is_available',
            'image',
            'fuel_type_display',
            'has_ac',
        )
# 1. Yol;
    # Bu method u override etmek yerine staff ve normal userlar için ayrı ayrı serializerlar oluşturulup
    # View de get_serializer_class methode u override edilerek user a göre serializerlar seçilebilir.
    def get_fields(self):
        fields = super().get_fields() # superindeki tüm fieldları al
        request = self.context.get('request') # context içindeki request i al. O anki user bilgisi requestin içinde var.
        
        # if request.user and not request.user.is_staff: # user var ve o user staff değil ise:
        #     fields.pop('availability') # availability field ını çıkar
        #     fields.pop('plate_number') # plate_number field ını çıkar
        # return fields  # if bloğuna girmezse tüm fieldları dön. user var ve o user staff ise superdeki tüm fieldları dön.

        if request.user and not request.user.is_staff: # user var ve o user staff değil ise:
            fields.pop('availability') # availability field ını çıkar
            fields.pop('plate_number') # plate_number field ını çıkar
        return fields  # if bloğuna girmezse tüm fieldları dön. user var ve o user staff ise superdeki tüm fieldları dön.


'''
# 2. Yol;
class CarStuffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = (
            'id',
            'plate_number',
            'brand',
            'model',
            'year',
            'gear',
            'rent_per_day',
            'availability',
        )

class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = (
            'id',
            'brand',
            'model',
            'year',
            'gear',
            'rent_per_day',
        )
'''


class ReservationSerializer(serializers.ModelSerializer):
    
    # total_price = serializers.SerializerMethodField(method_name='toplam') # method name tanımlanırsa aşağıda o isimle çağırabiliriz, tanımlamaz isek def get_total_price() olarak çağırmamız gerekir.
    
    # 'toplam' ismini 'get_total_price' yaparak DRF standartlarına uyalım
    total_price = serializers.SerializerMethodField()
    
    # 🎯 car_details isminde yeni bir alan oluşturup CarSerializer'ı bağlıyoruz
    car_details = CarSerializer(source='car', read_only=True)
    
    # 🎯 Müşteri detaylarını ekliyoruz
    customer_username = serializers.CharField(source='customer.username', read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    
    class Meta:
        model = Reservation
        fields = (
            'id',
            'customer',          # ID hala lazım olabilir (Logic için)
            'customer_username', # 👈 Yeni
            'customer_email',    # 👈 Yeni
            'car',
            'car_details', # 🎯 CarSerializer ile detayları ekledik
            'start_date',
            'end_date',
            'total_price',
        )
        # Müşteriyi biz otomatik atayacağımız için kullanıcı değiştiremesin
        read_only_fields = ('customer',)
        
    # def toplam(self, obj):
    #     'Günlük kiralama ücreti ile gün sayısını çarpar.'
    #     diff = (obj.end_date - obj.start_date).days
    #     # En az 1 günlük ücret alalım
    #     gun_sayisi = diff if diff > 0 else 1
    #     return obj.car.rent_per_day * gun_sayisi

    # def total_price(self, obj):
    def get_total_price(self, obj):
        'Günlük kiralama ücreti ile gün sayısını çarpar.'
        if obj.start_date and obj.end_date:
            diff = (obj.end_date - obj.start_date).days
            gun_sayisi = diff if diff > 0 else 1
            return obj.car.rent_per_day * gun_sayisi
        return 0

        
    def validate(self, attrs):
        start = attrs.get('start_date')
        end = attrs.get('end_date')

        # 🎯 1. Kritik Kontrol: Bitiş tarihi başlangıçtan önce olamaz
        if start >= end:
            raise serializers.ValidationError({
                "end_date": "Bitiş tarihi, başlangıç tarihinden önce veya aynı gün olamaz."
            })

        # 🎯 2. Ekstra Kontrol: Geçmiş tarihe rezervasyon yapılamaz
        if start < timezone.now().date():
            raise serializers.ValidationError({
                "start_date": "Geçmiş bir tarihe rezervasyon yapılamaz."
            })
            
        """
        Serializer seviyesinde hızlı kontrol. 
        Burada sadece temel mantık hatalarını tutup, 
        karmaşık çakışma kontrolünü modele de bırakabiliriz 
        veya her iki tarafta da tutabiliriz.
        """
        # 1. Mantıksal Tarih Kontrolü
        if attrs['start_date'] < timezone.now().date():
            raise serializers.ValidationError({"start_date": "Geçmiş bir tarihe rezervasyon yapılamaz."})
        
        if attrs['start_date'] >= attrs['end_date']:
            raise serializers.ValidationError({"end_date": "Bitiş tarihi, başlangıç tarihinden sonra olmalıdır."})

        # 2. Çakışma Kontrolü (DRY için modele delegasyon yapabiliriz ama 
        # API hızı ve net hata mesajı için burada kalması iyidir)
        conflicting_reservations = Reservation.objects.filter(
            car=attrs['car'],
            start_date__lt=attrs['end_date'],
            end_date__gt=attrs['start_date']
        )
            
        # Eğer bu bir UPDATE işlemiyse (instance varsa), kendi kaydını kontrolden muaf tut
        if self.instance:
            conflicting_reservations = conflicting_reservations.exclude(pk=self.instance.pk)

        if conflicting_reservations.exists():
            raise serializers.ValidationError("Bu araç seçilen tarihler arasında zaten rezerve edilmiş.")
            
        return attrs
    

