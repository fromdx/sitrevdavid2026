from rest_framework.routers import DefaultRouter
from .views import MotoristaViewSet, VeiculoViewSet, ViagemViewSet, UserRegistrationViewSet
from django.contrib import admin
from django.urls import path, include


router = DefaultRouter()
router.register(r'motoristas', MotoristaViewSet)
router.register(r'veiculos', VeiculoViewSet)
router.register(r'viagens', ViagemViewSet)
# Nova Rota: /api/usuarios/
router.register(r'usuarios', UserRegistrationViewSet) 

urlpatterns = router.urls

admin.site.site_header = "SITREV - Painel de Controle"    
admin.site.site_title = "SITREV Admin"
admin.site.index_title = "Gerenciamento de Telemetria"
