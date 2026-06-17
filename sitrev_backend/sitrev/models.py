from django.db import models
from django.utils import timezone

class Motorista(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome

class Veiculo(models.Model):
    modelo = models.CharField(max_length=50)
    placa = models.CharField(max_length=10, unique=True)
    imagem = models.ImageField(upload_to='veiculos/', null=True, blank=True)

    def __str__(self):
        return f"{self.modelo} ({self.placa})"

class Viagem(models.Model):
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE, related_name='viagens')
    motorista = models.ForeignKey(Motorista, on_delete=models.CASCADE, related_name='viagens')
    inicio_viagem = models.DateTimeField(default=timezone.now)
    fim_viagem = models.DateTimeField(null=True, blank=True)
    # Exemplo de dado manual para o mapa de Tucuruí:
    # "[[-3.766,-49.673], [-3.758,-49.665]]"
    rastro_gps = models.TextField(help_text="Coordenadas JSON de latitude e longitude", default="[]")

    @property
    def duracao_horas(self):
        if self.fim_viagem:
            diff = self.fim_viagem - self.inicio_viagem
            return round(diff.total_seconds() / 3600, 2)
        return None

    def __str__(self):
        return f"Viagem {self.id} - {self.motorista.nome} no {self.veiculo.placa}"
