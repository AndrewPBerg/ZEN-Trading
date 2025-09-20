# Authentication Flow Diagrams

This directory contains scripts and generated images for the ZEN Trading authentication flow diagrams.

## How to Generate Diagrams

The diagrams are generated using [Graphviz](https://graphviz.org/) and Python.  
The main script is [`auth-flow.py`](./auth-flow.py).

### 1. Install Python Dependencies

We use [uv](https://github.com/astral-sh/uv) for dependency management.

### 2. Install Graphviz Dependencies

> on windows install the graphviz binaries using choco
```bash
choco install graphviz
```
To install Chocolatey (choco) see the official Chocolatey installation guide:  
https://docs.chocolatey.org/en-us/choco/setup/

> on Mac

```bash
brew install graphviz
```

to install Homebrew (brew), see the official installation instructions:  
https://brew.sh/