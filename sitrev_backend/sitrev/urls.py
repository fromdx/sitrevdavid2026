from django.urls import path
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from .views import (
    MotoristaViewSet, 
    VeiculoViewSet, 
    ViagemViewSet, 
    UserRegistrationViewSet, 
    alterar_minha_senha
)

# Registros de ViewSets (CRUDs)
router = DefaultRouter()
router.register(r'motoristas', MotoristaViewSet)
router.register(r'veiculos', VeiculoViewSet)
router.register(r'viagens', ViagemViewSet)
router.register(r'usuarios', UserRegistrationViewSet)

# Outras Views Comum (inserir aqui)
urlpatterns = [
    # Rota correta: /api/alterar-senha/
    path('alterar-senha/', alterar_minha_senha, name='alterar_senha'),
] + router.urls

admin.site.site_header = "SITREV - Painel de Controle"    
admin.site.site_title = "SITREV Admin"
admin.site.index_title = "Gerenciamento de Telemetria"
