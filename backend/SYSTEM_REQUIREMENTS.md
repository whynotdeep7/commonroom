# System Requirements

The following system-level dependencies are required for code execution in different programming languages:

## Python
- Python 3.8 or higher
- pip (Python package manager)

## Node.js
- Node.js 14.x or higher
- npm (Node.js package manager)

## Java
- OpenJDK 11 or higher
- Maven (Java build tool)

## C/C++
- GCC 9.3.0 or higher
- G++ (C++ compiler)

## .NET
- .NET SDK 5.0 or higher

## TypeScript
- TypeScript 4.2.4 or higher
- ts-node (TypeScript execution environment)

## Go
- Go 1.16.5 or higher

## Rust
- Rust 1.52.1 or higher
- Cargo (Rust package manager)

## Installation Instructions

### macOS
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install python node openjdk gcc dotnet typescript go rust
```

### Ubuntu/Debian
```bash
# Update package lists
sudo apt update

# Install dependencies
sudo apt install python3 python3-pip nodejs npm default-jdk gcc g++ dotnet-sdk-5.0 typescript golang rustc cargo
```

### Windows
1. Install Python from https://www.python.org/downloads/
2. Install Node.js from https://nodejs.org/
3. Install OpenJDK from https://adoptium.net/
4. Install Visual Studio Build Tools for C/C++
5. Install .NET SDK from https://dotnet.microsoft.com/download
6. Install Go from https://golang.org/dl/
7. Install Rust from https://rustup.rs/

## Verification
After installation, verify that all dependencies are properly installed by running:
```bash
python --version
node --version
java --version
gcc --version
dotnet --version
tsc --version
go version
rustc --version
``` 