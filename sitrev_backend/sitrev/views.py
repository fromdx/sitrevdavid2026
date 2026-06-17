#from django.shortcuts import render

from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Motorista, Veiculo, Viagem
from .serializers import MotoristaSerializer, VeiculoSerializer, ViagemSerializer

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
