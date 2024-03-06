from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def test_api(request):
    data = {"hello" : "amoddddddddddddr"}
    return JsonResponse(data)

