from django.http import JsonResponse
from django.urls import get_resolver

def list_urls(request):
    """
    Returns a JSON response with all available URL patterns in the project.
    """
    resolver = get_resolver()
    url_patterns = resolver.url_patterns
    url_list = []

    def extract_patterns(patterns, prefix=''):
        for entry in patterns:
            if hasattr(entry, 'url_patterns'):
                extract_patterns(entry.url_patterns, prefix + str(entry.pattern))
            else:
                url_list.append(prefix + str(entry.pattern))

    extract_patterns(url_patterns)
    return JsonResponse({'urls': url_list})
