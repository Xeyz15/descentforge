using System;
using System.IO;
using System.Linq;
using Mono.Cecil;
using Mono.Cecil.Cil;

namespace DescentForgePatcher
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("==============================================================================");
            Console.WriteLine("DescentForge DLL Patch Analysis Tool\n==============================================================================\n");

            string dllPath = "MOD/DescentForge_camera.dll";

            try
            {
                Console.WriteLine($"Target DLL: {dllPath}");
                var dllBytes = File.ReadAllBytes(dllPath);
                Console.WriteLine($"  Size: {(dllBytes.Length / 1024):F1} KB\n");

                AssemblyDefinition assembly = AssemblyDefinition.ReadAssembly(dllPath);
                Console.WriteLine($"Loaded Assembly: {assembly.Name}\n");

                // Step 1: Show all types
                Console.WriteLine("==============================================================================");
                Console.WriteLine("ALL TYPES IN ASSEMBLY:\n==============================================================================\n");
                
                foreach (var type in assembly.MainModule.Types)
                {
                    if (type.FullName != null && !type.FullName.StartsWith("<"))
                    {
                        Console.WriteLine($"--- Type: {type.Name} ---");
                        
                        foreach (var method in type.Methods.Where(m => !m.IsStatic))
                        {
                            Console.WriteLine($"  Method: {method.Name}");
                        }
                    }
                }

                // Step 2: Search for Pan/Move/Look methods
                Console.WriteLine("\n\n==============================================================================");
                Console.WriteLine("SEARCHING FOR METHODS WITH Pan/Move/Look:\n==============================================================================\n");
                
                foreach (var type in assembly.MainModule.Types)
                {
                    if (type.FullName != null && !type.FullName.StartsWith("<"))
                    {
                        foreach (var method in type.Methods.Where(m => !m.IsStatic))
                        {
                            string methodName = method.Name;
                            
                            if (methodName.ToLower().Contains("pan") || 
                                methodName.ToLower().Contains("look") || 
                                methodName.ToLower().Contains("move"))
                            {
                                string declaringType = type.DeclaringType != null ? type.DeclaringType.Name : "global";
                                Console.WriteLine($"FOUND: {declaringType}.{methodName}");
                                
                                try
                                {
                                    if (method.Body != null && method.Body.Instructions.Count > 0)
                                    {
                                        var il = method.Body.Instructions;
                                        Console.WriteLine($"    IL Instructions ({il.Count}):");
                                        
                                        for (int i = 0; i < Math.Min(15, il.Count); i++)
                                        {
                                            var inst = il[i];
                                            if (!string.IsNullOrEmpty(inst.OpCode.Name))
                                            {
                                                Console.WriteLine($"      [{i:3}] {inst.OpCode.Name}");
                                            }
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine($"    Error: {ex.Message}");
                                }
                            }
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nError: {ex.Message}");
                Console.WriteLine($"   Type: {ex.GetType().Name}");
            }

            Console.WriteLine("\n\n==============================================================================");
            Console.WriteLine("ANALYSIS COMPLETE\n==============================================================================\n");
        }
    }
}
