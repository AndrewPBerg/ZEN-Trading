#!/usr/bin/env python3
"""
Authentication Flow Diagram Generator
Creates detailed Graphviz diagrams for the ZEN Trading authentication system
"""

import graphviz
import os

def create_signup_flow():
    """Create signup flow diagram"""
    dot = graphviz.Digraph(comment='Signup Flow', engine='dot')
    dot.attr(rankdir='TB', size='16,12', dpi='300')
    dot.attr('node', shape='box', style='rounded,filled', fontname='Arial', fontsize='14', width='2.5', height='1.2')
    dot.attr('edge', fontname='Arial', fontsize='12')
    
    # User Interface
    dot.node('UI1', 'User fills signup form\n(signup-form.tsx)', fillcolor='lightblue')
    dot.node('UI2', 'Form validation\n(required fields, email format, password match)', fillcolor='lightyellow')
    
    # API Layer
    dot.node('API1', 'register() function called\n(auth.ts)', fillcolor='lightgreen')
    dot.node('API2', 'POST /api/register/\n(Next.js rewrite)', fillcolor='lightcoral')
    dot.node('API3', 'Django backend\ncreates user account', fillcolor='lightpink')
    
    # Auto-login after registration
    dot.node('AUTO1', 'Auto-login triggered\n(auth.ts)', fillcolor='lightcyan')
    dot.node('AUTO2', 'POST /api/auth/token/\n(JWT token request)', fillcolor='lightcoral')
    dot.node('AUTO3', 'Django validates credentials\nreturns JWT tokens', fillcolor='lightpink')
    
    # User data fetch
    dot.node('USER1', 'GET /api/users/me/\n(with Bearer token)', fillcolor='lightcoral')
    dot.node('USER2', 'Django returns\nuser profile data', fillcolor='lightpink')
    
    # Storage
    dot.node('STORAGE1', 'Store JWT tokens\nin localStorage\n(zenTraderTokens)', fillcolor='lightgray')
    dot.node('STORAGE2', 'Store user data\nin localStorage\n(zenTraderUser)', fillcolor='lightgray')
    
    # Success
    dot.node('SUCCESS', 'Redirect to\nonboarding/discovery', fillcolor='lightgreen')
    
    # Error handling
    dot.node('ERROR', 'Display error message\n(form validation or API error)', fillcolor='lightcoral')
    
    # Flow connections
    dot.edge('UI1', 'UI2', label='Submit form')
    dot.edge('UI2', 'API1', label='Valid data')
    dot.edge('UI2', 'ERROR', label='Invalid data')
    dot.edge('API1', 'API2', label='HTTP request')
    dot.edge('API2', 'API3', label='Forward to Django')
    dot.edge('API3', 'AUTO1', label='User created')
    dot.edge('API3', 'ERROR', label='Registration failed')
    dot.edge('AUTO1', 'AUTO2', label='Login request')
    dot.edge('AUTO2', 'AUTO3', label='Validate credentials')
    dot.edge('AUTO3', 'USER1', label='Tokens received')
    dot.edge('AUTO3', 'ERROR', label='Login failed')
    dot.edge('USER1', 'USER2', label='Fetch profile')
    dot.edge('USER2', 'STORAGE1', label='Store tokens')
    dot.edge('STORAGE1', 'STORAGE2', label='Store user data')
    dot.edge('STORAGE2', 'SUCCESS', label='Complete')
    
    return dot

def create_login_flow():
    """Create login flow diagram"""
    dot = graphviz.Digraph(comment='Login Flow', engine='dot')
    dot.attr(rankdir='TB', size='16,12', dpi='300')
    dot.attr('node', shape='box', style='rounded,filled', fontname='Arial', fontsize='14', width='2.5', height='1.2')
    dot.attr('edge', fontname='Arial', fontsize='12')
    
    # User Interface
    dot.node('UI1', 'User fills login form\n(login-page.tsx)', fillcolor='lightblue')
    dot.node('UI2', 'Form validation\n(email format, required fields)', fillcolor='lightyellow')
    
    # API Layer
    dot.node('API1', 'login() function called\n(auth.ts)', fillcolor='lightgreen')
    dot.node('API2', 'POST /api/auth/token/\n(Next.js rewrite)', fillcolor='lightcoral')
    dot.node('API3', 'Django validates credentials\nreturns JWT tokens', fillcolor='lightpink')
    
    # User data fetch
    dot.node('USER1', 'GET /api/users/me/\n(with Bearer token)', fillcolor='lightcoral')
    dot.node('USER2', 'Django returns\nuser profile data', fillcolor='lightpink')
    
    # Storage
    dot.node('STORAGE1', 'Store JWT tokens\nin localStorage\n(zenTraderTokens)', fillcolor='lightgray')
    dot.node('STORAGE2', 'Store user data\nin localStorage\n(zenTraderUser)', fillcolor='lightgray')
    
    # Success
    dot.node('SUCCESS', 'Redirect to\ndiscovery page', fillcolor='lightgreen')
    
    # Error handling
    dot.node('ERROR', 'Display error message\n(invalid credentials)', fillcolor='lightcoral')
    
    # Flow connections
    dot.edge('UI1', 'UI2', label='Submit form')
    dot.edge('UI2', 'API1', label='Valid data')
    dot.edge('UI2', 'ERROR', label='Invalid data')
    dot.edge('API1', 'API2', label='HTTP request')
    dot.edge('API2', 'API3', label='Forward to Django')
    dot.edge('API3', 'USER1', label='Tokens received')
    dot.edge('API3', 'ERROR', label='Invalid credentials')
    dot.edge('USER1', 'USER2', label='Fetch profile')
    dot.edge('USER2', 'STORAGE1', label='Store tokens')
    dot.edge('STORAGE1', 'STORAGE2', label='Store user data')
    dot.edge('STORAGE2', 'SUCCESS', label='Complete')
    
    return dot

def create_protected_route_flow():
    """Create protected route flow diagram"""
    dot = graphviz.Digraph(comment='Protected Route Flow', engine='dot')
    dot.attr(rankdir='TB', size='16,12', dpi='300')
    dot.attr('node', shape='box', style='rounded,filled', fontname='Arial', fontsize='14', width='2.5', height='1.2')
    dot.attr('edge', fontname='Arial', fontsize='12')
    
    # Route access
    dot.node('ROUTE1', 'User navigates to\nprotected page', fillcolor='lightblue')
    dot.node('ROUTE2', 'ProtectedRoute\ncomponent loads', fillcolor='lightgreen')
    
    # Auth check
    dot.node('AUTH1', 'useAuth() hook\nchecks authentication', fillcolor='lightcyan')
    dot.node('AUTH2', 'Check localStorage\nfor tokens and user data', fillcolor='lightgray')
    dot.node('AUTH3', 'isAuthenticated()\nreturns true/false', fillcolor='lightyellow')
    
    # Loading state
    dot.node('LOADING', 'Show loading spinner\n"Aligning your stars..."', fillcolor='lightpink')
    
    # Authenticated path
    dot.node('AUTHENTICATED', 'Render protected\ncontent (children)', fillcolor='lightgreen')
    
    # Unauthenticated path
    dot.node('UNAUTHENTICATED', 'Redirect to\n/login page', fillcolor='lightcoral')
    
    # Storage sync
    dot.node('STORAGE_SYNC', 'Listen for storage\nchanges across tabs', fillcolor='lightgray')
    
    # Flow connections
    dot.edge('ROUTE1', 'ROUTE2', label='Page load')
    dot.edge('ROUTE2', 'AUTH1', label='Check auth')
    dot.edge('AUTH1', 'AUTH2', label='Check storage')
    dot.edge('AUTH2', 'AUTH3', label='Validate tokens')
    dot.edge('AUTH3', 'LOADING', label='isLoading = true')
    dot.edge('LOADING', 'AUTHENTICATED', label='isAuthenticated = true')
    dot.edge('LOADING', 'UNAUTHENTICATED', label='isAuthenticated = false')
    dot.edge('AUTH1', 'STORAGE_SYNC', label='Setup listeners')
    dot.edge('STORAGE_SYNC', 'AUTH1', label='Storage changed')
    
    return dot

def create_localstorage_architecture():
    """Create localStorage architecture diagram"""
    dot = graphviz.Digraph(comment='LocalStorage Architecture', engine='dot')
    dot.attr(rankdir='LR', size='18,12', dpi='300')
    dot.attr('node', shape='box', style='rounded,filled', fontname='Arial', fontsize='14', width='2.5', height='1.2')
    dot.attr('edge', fontname='Arial', fontsize='12')
    
    # Components
    dot.node('COMP1', 'Signup Form\n(signup-form.tsx)', fillcolor='lightblue')
    dot.node('COMP2', 'Login Form\n(login-page.tsx)', fillcolor='lightblue')
    dot.node('COMP3', 'Protected Routes\n(protected-route.tsx)', fillcolor='lightgreen')
    dot.node('COMP4', 'Navigation\n(navigation.tsx)', fillcolor='lightcyan')
    
    # Auth functions
    dot.node('AUTH1', 'register()\n(auth.ts)', fillcolor='lightgreen')
    dot.node('AUTH2', 'login()\n(auth.ts)', fillcolor='lightgreen')
    dot.node('AUTH3', 'logout()\n(auth.ts)', fillcolor='lightcoral')
    dot.node('AUTH4', 'useAuth()\n(use-auth.ts)', fillcolor='lightyellow')
    
    # Storage keys
    dot.node('STORAGE1', 'zenTraderTokens\n{\n  access: string\n  refresh: string\n}', fillcolor='lightgray')
    dot.node('STORAGE2', 'zenTraderUser\n{\n  id: number\n  email: string\n  username: string\n  first_name: string\n  last_name: string\n  date_joined: string\n  is_active: boolean\n}', fillcolor='lightgray')
    
    # Storage functions
    dot.node('FUNC1', 'getStoredTokens()\nsetStoredTokens()\nclearStoredTokens()', fillcolor='lightpink')
    dot.node('FUNC2', 'getStoredUser()\nsetStoredUser()', fillcolor='lightpink')
    
    # Flow connections
    dot.edge('COMP1', 'AUTH1', label='Form submit')
    dot.edge('COMP2', 'AUTH2', label='Form submit')
    dot.edge('COMP3', 'AUTH4', label='Check auth')
    dot.edge('COMP4', 'AUTH4', label='User menu')
    dot.edge('COMP4', 'AUTH3', label='Logout click')
    
    dot.edge('AUTH1', 'FUNC1', label='Store tokens')
    dot.edge('AUTH1', 'FUNC2', label='Store user')
    dot.edge('AUTH2', 'FUNC1', label='Store tokens')
    dot.edge('AUTH2', 'FUNC2', label='Store user')
    dot.edge('AUTH3', 'FUNC1', label='Clear tokens')
    dot.edge('AUTH3', 'FUNC2', label='Clear user')
    
    dot.edge('AUTH4', 'FUNC1', label='Read tokens')
    dot.edge('AUTH4', 'FUNC2', label='Read user')
    
    dot.edge('FUNC1', 'STORAGE1', label='localStorage')
    dot.edge('FUNC2', 'STORAGE2', label='localStorage')
    
    return dot

def create_complete_architecture():
    """Create complete system architecture diagram"""
    dot = graphviz.Digraph(comment='Complete Authentication Architecture', engine='dot')
    dot.attr(rankdir='TB', size='20,16', dpi='300')
    dot.attr('node', shape='box', style='rounded,filled', fontname='Arial', fontsize='12', width='2.2', height='1.0')
    dot.attr('edge', fontname='Arial', fontsize='10')
    
    # Frontend Layer
    with dot.subgraph(name='cluster_frontend') as frontend:
        frontend.attr(style='filled', color='lightblue', label='Frontend (Next.js)')
        frontend.node('UI1', 'Signup Page\n(signup/page.tsx)', fillcolor='white')
        frontend.node('UI2', 'Login Page\n(login/page.tsx)', fillcolor='white')
        frontend.node('UI3', 'Discovery Page\n(discovery/page.tsx)', fillcolor='white')
        frontend.node('UI4', 'Navigation\n(navigation.tsx)', fillcolor='white')
        frontend.node('COMP1', 'Signup Form\n(signup-form.tsx)', fillcolor='lightcyan')
        frontend.node('COMP2', 'Protected Route\n(protected-route.tsx)', fillcolor='lightgreen')
        frontend.node('HOOK1', 'useAuth Hook\n(use-auth.ts)', fillcolor='lightyellow')
        frontend.node('API1', 'Auth API\n(auth.ts)', fillcolor='lightpink')
        frontend.node('CONFIG1', 'Next.js Config\n(next.config.ts)', fillcolor='lightgray')
    
    # Storage Layer
    with dot.subgraph(name='cluster_storage') as storage:
        storage.attr(style='filled', color='lightgray', label='Browser Storage')
        storage.node('LS1', 'localStorage\nzenTraderTokens', fillcolor='white')
        storage.node('LS2', 'localStorage\nzenTraderUser', fillcolor='white')
    
    # Backend Layer
    with dot.subgraph(name='cluster_backend') as backend:
        backend.attr(style='filled', color='lightcoral', label='Backend (Django)')
        backend.node('DJ1', 'URL Patterns\n(urls.py)', fillcolor='white')
        backend.node('DJ2', 'Views\n(views.py)', fillcolor='white')
        backend.node('DJ3', 'Serializers\n(serializers.py)', fillcolor='white')
        backend.node('DJ4', 'Models\n(models.py)', fillcolor='white')
        backend.node('DJ5', 'JWT Authentication\n(SimpleJWT)', fillcolor='white')
    
    # Database
    dot.node('DB1', 'PostgreSQL\nUser Database', fillcolor='lightgreen')
    
    # Flow connections
    dot.edge('UI1', 'COMP1', label='Renders')
    dot.edge('UI2', 'COMP1', label='Renders')
    dot.edge('UI3', 'COMP2', label='Protected by')
    dot.edge('COMP1', 'API1', label='Calls')
    dot.edge('COMP2', 'HOOK1', label='Uses')
    dot.edge('HOOK1', 'API1', label='Calls')
    dot.edge('API1', 'CONFIG1', label='Via rewrite')
    dot.edge('CONFIG1', 'DJ1', label='Proxies to')
    dot.edge('DJ1', 'DJ2', label='Routes to')
    dot.edge('DJ2', 'DJ3', label='Uses')
    dot.edge('DJ3', 'DJ4', label='Serializes')
    dot.edge('DJ4', 'DB1', label='Stores in')
    dot.edge('DJ5', 'DJ2', label='Authenticates')
    
    dot.edge('API1', 'LS1', label='Stores tokens')
    dot.edge('API1', 'LS2', label='Stores user')
    dot.edge('HOOK1', 'LS1', label='Reads tokens')
    dot.edge('HOOK1', 'LS2', label='Reads user')
    
    return dot

def main():
    """Generate all authentication flow diagrams"""
    # Create output directory
    os.makedirs('figs', exist_ok=True)
    
    # Generate diagrams
    diagrams = {
        'signup-flow': create_signup_flow(),
        'login-flow': create_login_flow(),
        'protected-route-flow': create_protected_route_flow(),
        'localstorage-architecture': create_localstorage_architecture(),
        'complete-architecture': create_complete_architecture()
    }
    
    # Save diagrams
    for name, diagram in diagrams.items():
        print(f"Generating {name}...")
        
        # Save as PNG (high resolution)
        diagram.render(f'generated-figs/{name}', format='png', cleanup=True)
        print(f"  ✓ Saved generated-figs/{name}.png")
        
        # # Save as SVG
        # diagram.render(f'generated-figs/{name}', format='svg', cleanup=True)
        # print(f"  ✓ Saved generated-figs/{name}.svg")
        
        # # Save as PDF
        # diagram.render(f'generated-figs/{name}', format='pdf', cleanup=True)
        # print(f"  ✓ Saved generated-figs/{name}.pdf")
    
    print("\n🎉 All authentication flow diagrams generated successfully!")
    print("📁 Check the 'figs' directory for the generated images.")

if __name__ == '__main__':
    main()
