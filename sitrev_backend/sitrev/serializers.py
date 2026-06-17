from rest_framework import serializers
from .models import Motorista, Veiculo, Viagem

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
