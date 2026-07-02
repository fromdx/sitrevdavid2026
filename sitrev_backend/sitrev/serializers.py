from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Motorista, Veiculo, Viagem
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# Adiciona o campo customizado de 'tipo de usuario' ao JSON de retorno de /Login
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Gera os tokens JWT padrão (access e refresh)
        data = super().validate(attrs)

        obj_user = self.user

        # Se 'is_superuser' ou 'is_staff' for True, ele é admin. Caso contrário, comum.
        if obj_user.is_superuser or obj_user.is_staff:
            data['role'] = 'administrador'
        else:
            data['role'] = 'comum'
            
        return data

class UserRegistrationSerializer(serializers.ModelSerializer):
    # Força a senha a ser um campo apenas de escrita (nunca retornará no JSON por segurança)
    password = serializers.CharField(write_only=True, required=False)
    is_superuser = serializers.BooleanField(default=False, required=False)
    date_joined = serializers.CharField(read_only=True)
    last_login = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'password', 
            'first_name', 
            'last_name', 
            'email', 
            'is_superuser', 
            'is_staff', 
            'is_active', 
            'date_joined', 
            'last_login'
        ]
        # Garante que campos automáticos de sistema sejam apenas de leitura
        read_only_fields = ['date_joined', 'last_login']

    def create(self, validated_data):
        # Extrai os dados validados
        username = validated_data['username']
        password = validated_data['password']
        is_superuser = validated_data.get('is_superuser', False)

        # Cria o usuário com a senha criptografada de forma nativa
        user = User.objects.create_user(
            username=username, 
            password=password,
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Se for marcado como administrador, concede as permissões de acesso
        if is_superuser:
            user.is_superuser = True
            user.is_staff = True  # Permite acessar o painel /admin/ também
            
        user.save()
        return user

class PasswordChangeSerializer(serializers.Serializer):
    senha_atual = serializers.CharField(required=True, write_only=True)
    nova_senha = serializers.CharField(required=True, write_only=True)

    def validate_senha_atual(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("A senha atual digitada está incorreta.")
        return value    

class MotoristaSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    ultimo_veiculo = serializers.SerializerMethodField()
    ultimo_registro = serializers.SerializerMethodField()

    class Meta:
        model = Motorista
        fields = ['id', 'nome', 'status', 'ultimo_veiculo', 'ultimo_registro']

    def get_status(self, obj):
        ultima_viagem = obj.viagens.order_by('-inicio_viagem').first()
        if ultima_viagem and not ultima_viagem.fim_viagem:
            return "Em viagem"
        return "Parado"

    def get_ultimo_veiculo(self, obj):
        ultima_viagem = obj.viagens.order_by('-inicio_viagem').first()
        return ultima_viagem.veiculo.modelo if ultima_viagem else "Nenhum"

    def get_ultimo_registro(self, obj):
        ultima_viagem = obj.viagens.order_by('-inicio_viagem').first()
        return ultima_viagem.inicio_viagem if ultima_viagem else None

class ViagemSerializer(serializers.ModelSerializer):
    motorista_nome = serializers.CharField(source='motorista.nome', read_only=True)
    veiculo_placa = serializers.CharField(source='veiculo.placa', read_only=True)
    veiculo_modelo = serializers.CharField(source='veiculo.modelo', read_only=True)
    duracao = serializers.ReadOnlyField(source='duracao_horas')

    class Meta:
        model = Viagem
        fields = ['id', 'veiculo_placa', 'veiculo_modelo', 'motorista_nome', 'inicio_viagem', 'fim_viagem', 'duracao', 'rastro_gps']

class VeiculoSerializer(serializers.ModelSerializer):
    ultimo_motorista = serializers.SerializerMethodField()
    ultimo_registro = serializers.SerializerMethodField()
    rastro_gps_ultima_viagem = serializers.SerializerMethodField()

    class Meta:
        model = Veiculo
        fields = ['id', 'modelo', 'placa', 'imagem', 'ultimo_motorista', 'ultimo_registro', 'rastro_gps_ultima_viagem']

    def get_ultimo_motorista(self, obj):
        ultima = obj.viagens.order_by('-inicio_viagem').first()
        return ultima.motorista.nome if ultima else "Nenhum"

    def get_ultimo_registro(self, obj):
        ultima = obj.viagens.order_by('-inicio_viagem').first()
        return ultima.inicio_viagem if ultima else None

    def get_rastro_gps_ultima_viagem(self, obj):
        ultima = obj.viagens.order_by('-inicio_viagem').first()
        return ultima.rastro_gps if ultima else "[]"
