from django.db import models

class Partida(models.Model):
    jogador1 = models.CharField(max_length=100)
    jogador2 = models.CharField(max_length=100)
    vencedor = models.CharField(max_length=100, null=True, blank=True)
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.jogador1} vs {self.jogador2} - {self.vencedor or 'Empate'}"
