Django can feel like a code firehose at first. Just remember that every file has a purpose, and it builts up on itself to create the backend. Django is more htan just APIs, its database modelling, serialization, and plugins. 

# Usage
To run Django server:
```bash
uv run manage.py runserver 42069
```

# Models
Django is so cool that it even handles database management for YOU! defined in `models.py` as a subclass it automagically handles migrations, normalization, and connection.

# Settings
Most of the settings is boilerplate, the rest is fetched from the .env file. Highlights from `settings.py` are the `DATABASES` and `INSTALLED_APPS` settings.

# Urls
this is how Django knows which API endpoints do what. Essentially it maps the urls to a `views.py` method or function to process it.

# Views
views are how Django interact w/ web requests mapped from `urls.py`. So every view is essentially an API endpoint that is later mapped to a url. see `url.py`.

## View Template
You can either write `views` as class methods or functions. The only distinction is access and orgainization. below is a simple GET,POST,PUT, DELETE class:
> Note functional views use decorators instead of generic method names.
```python
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework import permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

class ExampleView(generics.APIView):
    """
    Template for authenticated views
    """
    # check to see if user is currently authenticated w/ JWT
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk=None):
        """GET request handler"""
        if pk:
            # Get specific item
            # obj = get_object_or_404(YourModel, pk=pk)
            return Response({'message': f'Get item {pk}'})
        else:
            # Get all items
            return Response({'message': 'Get all items'})
    
    def post(self, request):
        """POST request handler"""
        # Your creation logic here
        return Response(
            {'message': 'Item created'}, 
            status=status.HTTP_201_CREATED
        )
    
    def put(self, request, pk):
        """PUT request handler"""
        # obj = get_object_or_404(YourModel, pk=pk)
        # Your update logic here
        return Response({'message': f'Item {pk} updated'})
    
    def delete(self, request, pk):
        """DELETE request handler"""
        # obj = get_object_or_404(YourModel, pk=pk)
        # Your deletion logic here
        return Response({'message': f'Item {pk} deleted'})
```