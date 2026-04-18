from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .models import Car, Reservation
from .serializers import CarSerializer,ReservationSerializer
from .permissions import IsStaffOrReadOnly
from rest_framework.permissions import IsAuthenticated

from django.db.models import (
    Q, 
    Value, 
    BooleanField
    )

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from django.utils import timezone

# for dinamic is_available field 
from django.db.models import Exists, OuterRef


class CarView(ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = (IsStaffOrReadOnly,)  # [IsStaffOrReadOnly]
    
    def get_queryset(self):
        # 1. Her zaman en taze queryset ile başla
        queryset = Car.objects.all()
        
        # URL'den parametreleri alalım
        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')
        segment = self.request.query_params.get('segment')
        
        # 🎯 STRATEJİK KARAR:
        # Eğer kullanıcı staff değilse ZATEN sadece müsaitleri görmeli.
        # Eğer kullanıcı staff ise; sadece 'Arama' yapmıyorsa (Dashboard'daysa) her şeyi görsün.
        # Eğer staff bir 'start', 'end' veya 'segment' parametresi gönderdiyse (Ana sayfadaysa),
        # o zaman o da sadece yayında olan (availability=True) araçları görsün.
        
        is_searching = start or end or segment # Herhangi bir filtre varsa ana sayfadadır.
        
        if not self.request.user.is_staff or is_searching:
            queryset = queryset.filter(availability=True)


        # 2. TERS TARİH KONTROLÜ
        if start and end:
            if start >= end:
                return Car.objects.none()
            
            # Rezerve edilmiş araçları listeden çıkar (Exclude)
            not_available_ids = Reservation.objects.filter(
                Q(start_date__lt=end) & Q(end_date__gt=start)
            ).values_list('car_id', flat=True)
            
            queryset = queryset.exclude(id__in=not_available_ids)

            # Frontend uyumluluğu için is_available field'ını True olarak işaretle
            queryset = queryset.annotate(is_available=Value(True, output_field=BooleanField()))
        
        # 3. SEGMENT FİLTRELEMESİ
        if segment:
            queryset = queryset.filter(segment=segment)
        
        return queryset

class ReservationView(ListCreateAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):
        '''Staff değilse sadece kendi rezervasyonlarını görsün.'''
        if self.request.user.is_staff:
            return super().get_queryset()
        return super().get_queryset().filter(customer=self.request.user)
    
    def perform_create(self, serializer):
        """Müşteri bilgisini request'ten otomatik al ve kaydet."""
        serializer.save(customer=self.request.user)
    

class ReservationDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    # lookup_field = 'id'
    # NOT: update() metodunu silebilirsin; Serializer.validate() artık 
    # hem create hem update için otomatik çalışıyor!
    
    # 🎯 Güvenlik için bunu eklemelisin, yoksa 403 veya garip 404 hataları alabilirsin
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):
        """Kullanıcının sadece kendi rezervasyonunu silmesini sağlar."""
        if self.request.user.is_staff:
            return Reservation.objects.all()
        return Reservation.objects.filter(customer=self.request.user)