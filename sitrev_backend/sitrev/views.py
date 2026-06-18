#from django.shortcuts import render

from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser # Garante a trava de admin
from .models import Motorista, Veiculo, Viagem
from .serializers import MotoristaSerializer, VeiculoSerializer, ViagemSerializer, UserRegistrationSerializer
# Importa a permissão exclusiva de administrador
from rest_framework.permissions import IsAdminUser


class UserRegistrationViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    
    # Apenas tokens assinados como administrador podem acessar esta rota
    permission_classes = [IsAdminUser]

class MotoristaViewSet(viewsets.ModelViewSet):
    queryset = Motorista.objects.all()
    serializer_class = MotoristaSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome'] # Barra de busca genérica por nome

class VeiculoViewSet(viewsets.ModelViewSet):
    queryset = Veiculo.objects.all()
    serializer_class = VeiculoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['modelo', 'placa'] # Barra de busca por modelo ou placa

    # Cria a rota específica: /api/veiculos/{id}/viagens/
    @action(detail=True, methods=['get'])
    def viagens(self, request, pk=None):
        veiculo = self.get_object()
        viagens = veiculo.viagens.order_by('-inicio_viagem')
        serializer = ViagemSerializer(viagens, many=True)
        return Response(serializer.data)

class ViagemViewSet(viewsets.ModelViewSet):
    queryset = Viagem.objects.order_by('-inicio_viagem')
    serializer_class = ViagemSerializer

class AdminDashboardViewSet(viewsets.ModelViewSet):
    queryset = Motorista.objects.all()
    serializer_class = MotoristaSerializer
    
    # Trava de Segurança: Bloqueia na hora se um usuário comum tentar acessar o link
    permission_classes = [IsAdminUser] 
