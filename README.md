# DescentForge Camera Patch - Analysis Tool

This tool analyzes DescentForge_camera.dll to find methods that handle camera pan/look actions.

## Project Structure
- **CameraPatcher.csproj** - .NET 10 project using AsmResolver 6.1.0 + Mono.Cecil
- **Program.cs** - Analysis tool for finding Pan/Move/Look methods  
- **DescentForge_camera.dll** - Target DLL for patching (will be uploaded separately)

## Usage
```bash
dotnet restore
dotnet run
```

## Planned Patches (Applied Individually)
1. **Pillar Fix** - Geometry sealing fix
2. **Camera Command/Message** - Delay for camera actions  
3. **Camera Pan** - 0.5s delay for Pan-Up behavior

## Current Status
- ✅ Build successful with AsmResolver 6.1.0 (0 errors, 0 warnings)
- ✅ DLL analysis tool working
- ✅ GitHub repository initialized and ready
- ❌ No patches applied yet

---
