import json
import re
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse

class SanitizeJsonMiddleware(MiddlewareMixin):

    def process_request(self, request):
        if request.content_type == 'application/json' and request.body:
            try:
                data = json.loads(request.body)
                sanitized_data = self.sanitize_json(data)
                request._body = json.dumps(sanitized_data).encode('utf-8')
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON'}, status=400)

    def sanitize_json(self, data):
        if isinstance(data, dict):
            return {k: self.sanitize_json(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self.sanitize_json(item) for item in data]
        elif isinstance(data, str):
            return self.strip_html_tags(data)
        return data

    def strip_html_tags(self, text):
        tag_re = re.compile(r'<[^>]+>')
        return tag_re.sub('', text)
