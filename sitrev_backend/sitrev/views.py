#from django.shortcuts import render

from django.contrib.auth.models import User
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser # Garante a trava de admin
from .models import Motorista, Veiculo, Viagem
from .serializers import MotoristaSerializer, VeiculoSerializer, ViagemSerializer, UserRegistrationSerializer, PasswordChangeSerializer
# Importa a permissão exclusiva de administrador
from rest_framework.permissions import IsAdminUser


class UserRegistrationViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserRegistrationSerializer
    
    # Apenas tokens assinados como administrador podem acessar esta rota
    permission_classes = [IsAdminUser]

    # Força a listagem a retornar apenas os dados seguros sem quebrar
    def list(self, request, *args, **kwargs):
        usuarios = User.objects.all().order_by('id').values(
            'id', 
            'username',
            'first_name', 
            'last_name', 
            'email', 
            'is_superuser', 
            'is_staff', 
            'is_active', 
            'date_joined', 
            'last_login'
        )
        return Response(list(usuarios), status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def alterar_minha_senha(request):
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['nova_senha'])
        user.save()
        return Response({"detail": "Senha alterada com sucesso!"}, status=status.HTTP_200_OK)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
