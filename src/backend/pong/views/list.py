from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from pong.models import Match


@require_http_methods(["GET"])
def list_matches(request):
    matches = Match.objects.filter(is_deleted=False).values()
    return JsonResponse(list(matches), safe=False)
