from rest_framework import serializers
from .models import Partida

class PartidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partida
        fields = '__all__'
