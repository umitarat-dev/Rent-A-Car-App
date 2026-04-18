from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth.models import User
from decimal import Decimal
from django.core.exceptions import ValidationError


class Car(models.Model):
    GEAR = (
        ('a', 'automatic'),
        ('m', 'manuel'),
    )
    SEGMENTS = (
        ('e', 'Economy'),
        ('c', 'Comfort'),
        ('p', 'Premium'),
        ('s', 'SUV'),
    )
    FUEL_CHOICES = [
        ('gasoline', 'Benzin'),
        ('diesel', 'Dizel'),
        ('hybrid', 'Hibrit'),
        ('electric', 'Elektrik'),
    ]
    plate_number = models.CharField(max_length=15, unique=True)
    brand = models.CharField(max_length=15)
    model = models.CharField(max_length=20)
    year = models.SmallIntegerField()
    gear = models.CharField(max_length=1, choices=GEAR)
    segment = models.CharField(max_length=1, choices=SEGMENTS, default='e')
    rent_per_day = models.DecimalField(
        max_digits=7, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal(1))]
        ) # price larda decimal field kullanılır. eksi değer girilmesin diye de validator ekledik.
    fuel_type = models.CharField(
        max_length=20, 
        choices=FUEL_CHOICES, 
        default='gasoline',
        verbose_name="Yakıt Tipi"
    )
    has_ac = models.BooleanField(
        default=True, 
        verbose_name="Klima Var mı?"
    )
    availability = models.BooleanField(default=True)
    image = models.ImageField(upload_to='car_images/', null=True, blank=True) # AWS S3 için image field ekledik.
    
    def __str__(self):
        return f'{self.model} - {self.brand} - {self.plate_number}'

 
class Reservation(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customers')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='cars')
    start_date = models.DateField()
    end_date = models.DateField()
    
    def __str__(self):
        return f'Customer {self.customer} reserved {self.car}'
    
    # class Meta:
    #     constraints = [
    #         models.UniqueConstraint(
    #             fields=['customer', 'start_date', 'end_date'], name='user_rent_date'
    #         )
    #     ]
    
    def clean(self):
        """
        Hem Admin panelini hem de API'yi kapsayan ana denetim merkezi.
        """
        # 1. ADIM: Tarihlerin seçildiğinden emin ol (None hatası almamak için)
        if not self.start_date or not self.end_date:
            return
        
        # 2. ADIM: TERS TARİH KONTROLÜ (Yeni eklenen defans hattı)
        if self.start_date >= self.end_date:
            # Mesajı bir sözlük içinde gönderiyoruz ki hata tam 'end_date' kutusunun altında görünsün
            raise ValidationError({
                'end_date': f"Hata: Bitiş tarihi ({self.end_date}), başlangıç tarihinden ({self.start_date}) sonra olmalıdır!"
            })
            
        # 3. ADIM: ÇAKIŞMA KONTROLÜ (Senin mevcut sağlam kodun)
        # Eğer tarihler tersse bu kısma hiç geçilmeyeceği için matematiksel hata riskini sıfırladık.
        conflicting_reservations = Reservation.objects.filter(
            car=self.car,
            start_date__lt=self.end_date,
            end_date__gt=self.start_date
        )
                
        if self.pk: # Eğer bu bir güncelleme ise kendi kaydını çıkar
            conflicting_reservations = conflicting_reservations.exclude(pk=self.pk)

        if conflicting_reservations.exists():
            raise ValidationError(
                f"Hata: {self.car} plakalı araç seçilen {self.start_date} / {self.end_date} "
                "tarihleri arasında zaten dolu!"
            )
        
    def save(self, *args, **kwargs):
        # save() metodu otomatik olarak clean()'i çağırmaz, biz zorluyoruz
        self.clean()  # Temizlik/validasyon işlemini çağır
        super().save(*args, **kwargs)  # Ardından normal kaydetme işlemi

    class Meta:
        # Eski hatalı constraint'i sildik, sadece araba bazlı basit bir eşleşme ekleyebiliriz 
        # (Gerçek çakışmayı yukarıdaki clean() hallediyor zaten)
        ordering = ['-start_date']
