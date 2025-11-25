from rest_framework import serializers
from .models import Partida
from rest_framework.reverse import reverse

class PartidaSerializer(serializers.ModelSerializer):
    links = serializers.SerializerMethodField()

    class Meta:
        model = Partida
        fields = ['id', 'jogador1', 'jogador2', 'vencedor', 'data', 'links']

    def get_links(self, obj):
        request = self.context.get('request') 

        return {
            'self': reverse('historico-detail', kwargs={'pk': obj.pk}, request=request),
            'list': reverse('historico-list', request=request)
        }
