from django.utils.html import escape

def sanitize_input(view_func):
    def wrapper(request, *args, **kwargs):
        if request.method in ['POST', 'PUT', 'PATCH']:
            request.POST = request.POST.copy()
            for key, value in request.POST.items():
                request.POST[key] = escape(value)
        return view_func(request, *args, **kwargs)
    return wrapper
