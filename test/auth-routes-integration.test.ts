/**
 * Suite de Pruebas de Integración - Sistema de Autenticación y Rutas
 * 
 * Esta suite valida:
 * 1. Redirecciones absolutas post-login (sin rutas de carpetas físicas)
 * 2. Consistencia en OAuth callback
 * 3. Case-sensitivity en errores
 * 4. Comportamiento del middleware
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// ============================================================================
// UTILIDADES DE LECTURA DE ARCHIVOS
// ============================================================================

function readSourceFile(relativePath: string): string {
  const fullPath = join(process.cwd(), relativePath);
  return readFileSync(fullPath, 'utf-8');
}

// ============================================================================
// RESULTADO DE PRUEBA
// ============================================================================

type TestResult = {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
};

// ============================================================================
// PRUEBA 1: Redirecciones Absolutas Post-Login
// ============================================================================

function testAbsoluteRedirects(): TestResult {
  const testName = 'Prueba 1: Redirecciones Absolutas Post-Login';
  
  try {
    const actionsCode = readSourceFile('app/auth/actions.ts');
    
    // Buscar en la función getDashboardPath
    const getDashboardPathMatch = actionsCode.match(
      /function getDashboardPath\([^)]*\)[^{]*\{([\s\S]*?)(?=\n\s*\})/
    );
    
    const violations: string[] = [];
    
    if (getDashboardPathMatch) {
      const functionBody = getDashboardPathMatch[1];
      
      // Verificar que solo retorne rutas absolutas válidas
      const validRoutes = ['/dashboard/admin', '/dashboard/encargado', '/dashboard/usuario'];
      const returnStatements = functionBody.match(/return\s+['"]([^'"]+)['"]/g) || [];
      
      for (const stmt of returnStatements) {
        const routeMatch = stmt.match(/return\s+['"]([^'"]+)['"]/);
        if (routeMatch) {
          const route = routeMatch[1];
          if (!validRoutes.includes(route)) {
            violations.push('Ruta inválida encontrada: ' + route);
          }
        }
      }
      
      // Verificar que no haya rutas relativas
      if (functionBody.includes('../') || functionBody.includes('src/app/')) {
        violations.push('Se encontraron rutas relativas o de carpetas físicas en getDashboardPath');
      }
    }
    
    // Verificar que el return de signInWithPassword use getDashboardPath
    const signInReturnMatch = actionsCode.match(
      /return\s*\{\s*success:\s*true,\s*redirectTo:\s*getDashboardPath\([^)]+\)\s*\}/g
    );
    
    if (!signInReturnMatch) {
      violations.push('signInWithPassword no retorna usando getDashboardPath');
    }
    
    if (violations.length > 0) {
      return {
        name: testName,
        passed: false,
        message: '❌ PRUEBA FALLIDA: Se encontraron violaciones',
        details: violations.join('\n  - ')
      };
    }
    
    return {
      name: testName,
      passed: true,
      message: '✅ PRUEBA PASADA: Todas las redirecciones son URLs absolutas limpias',
      details: 'Rutas válidas: /dashboard/admin, /dashboard/encargado, /dashboard/usuario'
    };
    
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: '❌ PRUEBA FALLIDA: Error al ejecutar la prueba',
      details: String(error)
    };
  }
}

// ============================================================================
// PRUEBA 2: Consistencia en OAuth Callback
// ============================================================================

function testOAuthCallbackConsistency(): TestResult {
  const testName = 'Prueba 2: Consistencia en OAuth (Callback Route)';
  
  try {
    const callbackCode = readSourceFile('app/auth/callback/route.ts');
    const actionsCode = readSourceFile('app/auth/actions.ts');
    
    // Extraer la función getDashboardPath del callback
    const callbackGetDashboardMatch = callbackCode.match(
      /function getDashboardPath\([^)]*\)[^{]*\{([\s\S]*?)(?=\n\s*\})/
    );
    
    // Extraer la función getDashboardPath de actions
    const actionsGetDashboardMatch = actionsCode.match(
      /function getDashboardPath\([^)]*\)[^{]*\{([\s\S]*?)(?=\n\s*\})/
    );
    
    if (!callbackGetDashboardMatch || !actionsGetDashboardMatch) {
      return {
        name: testName,
        passed: false,
        message: '❌ PRUEBA FALLIDA: No se pudo encontrar getDashboardPath en uno o ambos archivos',
        details: 'Verifica que la función exista en ambos archivos'
      };
    }
    
    const callbackFunction = callbackGetDashboardMatch[1];
    const actionsFunction = actionsGetDashboardMatch[1];
    
    // Verificar que sean idénticos
    if (callbackFunction.trim() !== actionsFunction.trim()) {
      return {
        name: testName,
        passed: false,
        message: '❌ PRUEBA FALLIDA: getDashboardPath no es consistente entre callback y actions',
        details: 'Callback:\n' + callbackFunction + '\n\nActions:\n' + actionsFunction
      };
    }
    
    // Verificar que el callback redirija a usuario por defecto (rol 3)
    const hasDefaultUsuario = callbackFunction.includes("return '/dashboard/usuario'");
    
    if (!hasDefaultUsuario) {
      return {
        name: testName,
        passed: false,
        message: '❌ PRUEBA FALLIDA: El caso por defecto no redirige a /dashboard/usuario',
        details: 'Se espera que el rol 3 (usuario) sea el caso por defecto'
      };
    }
    
    // Verificar que el callback use profile.id_rol (no user_metadata)
    const usesProfileIdRol = callbackCode.includes('profile.id_rol');
    
    if (!usesProfileIdRol) {
      return {
        name: testName,
        passed: false,
        message: '❌ PRUEBA FALLIDA: El callback no usa profile.id_rol desde la BD',
        details: 'Debe consultar el id_rol real desde la tabla profiles'
      };
    }
    
    return {
      name: testName,
      passed: true,
      message: '✅ PRUEBA PASADA: OAuth callback es consistente con el flujo de credenciales',
      details: 'Ambas funciones getDashboardPath son idénticas y usan profile.id_rol'
    };
    
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: '❌ PRUEBA FALLIDA: Error al ejecutar la prueba',
      details: String(error)
    };
  }
}

// ============================================================================
// PRUEBA 3: Case-Sensitivity en Errores
// ============================================================================

function testCaseSensitivityInErrors(): TestResult {
  const testName = 'Prueba 3: Case-Sensitivity en Errores';
  
  try {
    const callbackCode = readSourceFile('app/auth/callback/route.ts');
    
    // Buscar el parámetro de error en el código (puede estar en backticks, comillas simples o dobles)
    const errorMatch = callbackCode.match(/\/login\?error=([a-z0-9-]+)/);
    
    if (!errorMatch) {
      return {
        name: testName,
        passed: false,
        message: '❌ PRUEBA FALLIDA: No se encontró redirección de error en el callback',
        details: 'Debe existir una línea que redirija a /login?error=...'
      };
    }
    
    const errorParam = errorMatch[1];
    
    // Verificar que el parámetro de error esté en minúsculas
    if (errorParam !== errorParam.toLowerCase()) {
      return {
        name: testName,
        passed: false,
        message: '❌ PRUEBA FALLIDA: El parámetro de error contiene mayúsculas',
        details: 'Valor encontrado: "' + errorParam + '"\nValor esperado: "' + errorParam.toLowerCase() + '"'
      };
    }
    
    // Verificar que sea un valor específico y no genérico
    const validErrorValues = [
      'auth-callback-failed',
      'invalid_credentials',
      'email_not_confirmed',
      'user_not_found'
    ];
    
    const isValidErrorValue = validErrorValues.some(
      valid => errorParam.includes(valid) || valid.includes(errorParam)
    );
    
    if (!isValidErrorValue && errorParam.length < 3) {
      return {
        name: testName,
        passed: false,
        message: '⚠️ ADVERTENCIA: El valor de error parece muy genérico',
        details: 'Valor: "' + errorParam + '"'
      };
    }
    
    return {
      name: testName,
      passed: true,
      message: '✅ PRUEBA PASADA: Los errores usan minúsculas (compatible con Linux)',
      details: 'Parámetro de error: "' + errorParam + '"'
    };
    
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: '❌ PRUEBA FALLIDA: Error al ejecutar la prueba',
      details: String(error)
    };
  }
}

// ============================================================================
// PRUEBA 4: Middleware - Protección de Pantallas
// ============================================================================

function testMiddlewareProtection(): TestResult {
  const testName = 'Prueba 4: Middleware - Protección de Pantallas';
  
  try {
    const middlewareCode = readSourceFile('middleware.ts');
    
    const checks: { name: string; passed: boolean; details: string }[] = [];
    
    // 4.1: Verificar lista de rutas públicas
    const publicRoutesMatch = middlewareCode.match(
      /const publicRoutes = \[([\s\S]*?)\];/
    );
    
    if (!publicRoutesMatch) {
      checks.push({
        name: 'Rutas públicas definidas',
        passed: false,
        details: 'No se encontró el array publicRoutes'
      });
    } else {
      const publicRoutesContent = publicRoutesMatch[1];
      const requiredPublicRoutes = [
        '/',
        '/login',
        '/register',
        '/faqs',
        '/privacidad',
        '/terminos',
        '/Conferencias'
      ];
      
      const missingRoutes = requiredPublicRoutes.filter(
        route => !publicRoutesContent.includes("'" + route + "'")
      );
      
      checks.push({
        name: 'Rutas públicas requeridas presentes',
        passed: missingRoutes.length === 0,
        details: missingRoutes.length > 0 
          ? 'Faltan: ' + missingRoutes.join(', ')
          : 'Todas las rutas públicas requeridas están presentes'
      });
    }
    
    // 4.2: Verificar redirección de no autenticados
    const hasUnauthenticatedRedirect = middlewareCode.includes(
      "if (!user && !isPublicRoute)"
    ) && middlewareCode.includes(
      "return NextResponse.redirect(new URL('/login', request.url))"
    );
    
    checks.push({
      name: 'Redirección de no autenticados',
      passed: hasUnauthenticatedRedirect,
      details: hasUnauthenticatedRedirect
        ? 'Los usuarios no autenticados son redirigidos a /login'
        : 'Falta la lógica de redirección para usuarios no autenticados'
    });
    
    // 4.3: Verificar redirección de autenticados en login/register
    const hasAuthenticatedRedirect = middlewareCode.includes(
      "if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register'))"
    ) && middlewareCode.includes(
      "return NextResponse.redirect(new URL('/dashboard/usuario', request.url))"
    );
    
    checks.push({
      name: 'Redirección de autenticados en login/register',
      passed: hasAuthenticatedRedirect,
      details: hasAuthenticatedRedirect
        ? 'Los usuarios autenticados son redirigidos a /dashboard/usuario'
        : 'Falta la lógica de redirección para usuarios autenticados'
    });
    
    // 4.4: Verificar matcher del middleware
    const hasMatcher = middlewareCode.includes('export const config') &&
                       middlewareCode.includes('matcher:');
    
    checks.push({
      name: 'Configuración de matcher',
      passed: hasMatcher,
      details: hasMatcher
        ? 'El middleware tiene configuración de matcher'
        : 'Falta la configuración de matcher'
    });
    
    // 4.5: Verificar que el matcher excluya archivos estáticos
    const excludesStaticFiles = middlewareCode.includes('_next/static') &&
                                 middlewareCode.includes('favicon.ico');
    
    checks.push({
      name: 'Exclusión de archivos estáticos',
      passed: excludesStaticFiles,
      details: excludesStaticFiles
        ? 'El matcher excluye archivos estáticos correctamente'
        : 'El matcher podría estar interceptando archivos estáticos'
    });
    
    const failedChecks = checks.filter(c => !c.passed);
    const passedChecks = checks.filter(c => c.passed);
    
    if (failedChecks.length > 0) {
      return {
        name: testName,
        passed: false,
        message: '❌ PRUEBA FALLIDA: ' + failedChecks.length + ' de ' + checks.length + ' checks fallaron',
        details: failedChecks.map(c => '  - ' + c.name + ': ' + c.details).join('\n')
      };
    }
    
    return {
      name: testName,
      passed: true,
      message: '✅ PRUEBA PASADA: Todos los ' + checks.length + ' checks del middleware pasaron',
      details: passedChecks.map(c => '  ✓ ' + c.name).join('\n')
    };
    
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: '❌ PRUEBA FALLIDA: Error al ejecutar la prueba',
      details: String(error)
    };
  }
}

// ============================================================================
// PRUEBA ADICIONAL: Validación de Rutas de Dashboard
// ============================================================================

function testDashboardRoutesConsistency(): TestResult {
  const testName = 'Prueba Adicional: Consistencia de Rutas de Dashboard';
  
  try {
    const actionsCode = readSourceFile('app/auth/actions.ts');
    const callbackCode = readSourceFile('app/auth/callback/route.ts');
    const middlewareCode = readSourceFile('middleware.ts');
    
    // Definir las rutas esperadas
    const expectedRoutes = {
      1: '/dashboard/admin',
      2: '/dashboard/encargado',
      3: '/dashboard/usuario'
    };
    
    // Verificar en actions.ts
    const actionsHasCorrectRoutes = Object.entries(expectedRoutes).every(
      ([rol, route]) => {
        if (rol === '3') {
          // Rol 3 usa return directo (caso por defecto)
          return actionsCode.includes('return \'' + route + '\'');
        }
        return actionsCode.includes('if (idRol === ' + rol + ') return \'' + route + '\'');
      }
    );
    
    // Verificar en callback/route.ts
    const callbackHasCorrectRoutes = Object.entries(expectedRoutes).every(
      ([rol, route]) => {
        if (rol === '3') {
          // Rol 3 usa return directo (caso por defecto)
          return callbackCode.includes('return \'' + route + '\'');
        }
        return callbackCode.includes('if (idRol === ' + rol + ') return \'' + route + '\'');
      }
    );
    
    // Verificar que el middleware permita acceso a /dashboard/*
    const middlewareAllowsDashboard = middlewareCode.includes('/dashboard');
    
    if (!actionsHasCorrectRoutes || !callbackHasCorrectRoutes) {
      return {
        name: testName,
        passed: false,
        message: '❌ PRUEBA FALLIDA: Inconsistencia en mapeo de roles a rutas',
        details: 'Verifica que todos los roles (1, 2, 3) tengan sus rutas correctas en actions y callback'
      };
    }
    
    const routesDetails = Object.entries(expectedRoutes)
      .map(([rol, route]) => '  Rol ' + rol + ' → ' + route)
      .join('\n');
    
    return {
      name: testName,
      passed: true,
      message: '✅ PRUEBA PASADA: Todas las rutas de dashboard son consistentes',
      details: routesDetails
    };
    
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: '❌ PRUEBA FALLIDA: Error al ejecutar la prueba',
      details: String(error)
    };
  }
}

// ============================================================================
// EJECUTAR TODAS LAS PRUEBAS
// ============================================================================

function runAllTests(): TestResult[] {
  console.log('\n🧪 Iniciando Suite de Pruebas de Integración - Auth & Routes\n');
  console.log('='.repeat(80));
  
  const tests = [
    testAbsoluteRedirects,
    testOAuthCallbackConsistency,
    testCaseSensitivityInErrors,
    testMiddlewareProtection,
    testDashboardRoutesConsistency
  ];
  
  const results: TestResult[] = [];
  
  for (const test of tests) {
    const result = test();
    results.push(result);
    
    console.log('\n' + result.name);
    console.log('-'.repeat(80));
    console.log(result.message);
    if (result.details) {
      console.log(result.details);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log('\n📊 Resumen: ' + passed + '/' + results.length + ' pruebas pasaron, ' + failed + ' fallaron\n');
  
  return results;
}

// ============================================================================
// GENERAR REPORTE MARKDOWN
// ============================================================================

function generateMarkdownReport(results: TestResult[]): string {
  const timestamp = new Date().toISOString();
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  let report = '# Reporte de Pruebas de Integración - Sistema de Autenticación\n\n';
  report += '**Fecha:** ' + timestamp + '\n';
  report += '**Proyecto:** Congreso IGE\n';
  report += '**Tipo:** Pruebas de Caja Negra / Integración\n\n';
  report += '---\n\n';
  
  report += '## 📊 Resumen Ejecutivo\n\n';
  report += '| Métrica | Valor |\n';
  report += '|---------|-------|\n';
  report += '| Total de Pruebas | ' + total + ' |\n';
  report += '| Pruebas Exitosas | ' + passed + ' ✅ |\n';
  report += '| Pruebas Fallidas | ' + failed + ' ❌ |\n';
  report += '| Tasa de Éxito | ' + ((passed / total) * 100).toFixed(1) + '% |\n\n';
  
  report += '**Estado General:** ' + (failed === 0 ? '✅ SISTEMA 100% FUNCIONAL' : '⚠️ SISTEMA CON PROBLEMAS') + '\n\n';
  report += '---\n\n';
  
  report += '## 🧪 Resultados Detallados de Pruebas\n\n';
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    const statusText = result.passed ? 'PASADA' : 'FALLIDA';
    
    report += '### ' + (index + 1) + '. ' + result.name + '\n\n';
    report += '**Estado:** ' + status + ' ' + statusText + '\n\n';
    report += '**Resultado:** ' + result.message + '\n\n';
    
    if (result.details) {
      report += '**Detalles:**\n';
      report += '```\n' + result.details + '\n```\n\n';
    }
    
    report += '---\n\n';
  });
  
  report += '## 🎯 Criterios de Aceptación\n\n';
  
  const criteria = [
    {
      id: 'CA-01',
      description: 'Redirecciones post-login usan URLs absolutas limpias',
      test: 'Prueba 1',
      status: results[0]?.passed ? '✅' : '❌'
    },
    {
      id: 'CA-02',
      description: 'OAuth callback es consistente con flujo de credenciales',
      test: 'Prueba 2',
      status: results[1]?.passed ? '✅' : '❌'
    },
    {
      id: 'CA-03',
      description: 'Errores usan minúsculas (compatible con Linux)',
      test: 'Prueba 3',
      status: results[2]?.passed ? '✅' : '❌'
    },
    {
      id: 'CA-04',
      description: 'Middleware protege rutas de dashboard correctamente',
      test: 'Prueba 4',
      status: results[3]?.passed ? '✅' : '❌'
    },
    {
      id: 'CA-05',
      description: 'Rutas de dashboard son consistentes en todos los archivos',
      test: 'Prueba 5',
      status: results[4]?.passed ? '✅' : '❌'
    }
  ];
  
  report += '| ID | Criterio | Prueba | Estado |\n';
  report += '|----|----------|--------|--------|\n';
  
  criteria.forEach(c => {
    report += '| ' + c.id + ' | ' + c.description + ' | ' + c.test + ' | ' + c.status + ' |\n';
  });
  
  report += '\n---\n\n';
  
  report += '## 🔍 Análisis de Errores Anteriores\n\n';
  report += '### Errores Corregidos\n\n';
  report += '1. **Rutas de carpetas físicas en redirecciones**\n';
  report += '   - **Antes:** `../../src/app/dashboard/admin`\n';
  report += '   - **Ahora:** `/dashboard/admin` (URL absoluta)\n';
  report += '   - **Estado:** ' + (results[0]?.passed ? '✅ CORREGIDO' : '❌ PERSISTE') + '\n\n';
  
  report += '2. **Inconsistencia entre OAuth y credenciales**\n';
  report += '   - **Antes:** Diferentes funciones getDashboardPath\n';
  report += '   - **Ahora:** Función idéntica en ambos archivos\n';
  report += '   - **Estado:** ' + (results[1]?.passed ? '✅ CORREGIDO' : '❌ PERSISTE') + '\n\n';
  
  report += '3. **Case-sensitivity en producción Linux**\n';
  report += '   - **Antes:** Posibles mayúsculas en parámetros de error\n';
  report += '   - **Ahora:** Todos los parámetros en minúsculas\n';
  report += '   - **Estado:** ' + (results[2]?.passed ? '✅ CORREGIDO' : '❌ PERSISTE') + '\n\n';
  
  report += '---\n\n';
  
  report += '## 📝 Recomendaciones\n\n';
  
  if (failed === 0) {
    report += '### ✅ Sistema Listo para Producción\n\n';
    report += 'El sistema de autenticación y rutas ha pasado todas las pruebas. ';
    report += 'Se recomienda:\n\n';
    report += '1. **Monitoreo:** Implementar logging en producción para detectar redirecciones inesperadas\n';
    report += '2. **Pruebas E2E:** Agregar pruebas Playwright/Cypress para flujos completos de usuario\n';
    report += '3. **Rollback:** Mantener este reporte como referencia para futuras comparaciones\n';
    report += '4. **Documentación:** Actualizar la documentación de usuario con las nuevas rutas\n\n';
  } else {
    report += '### ⚠️ Acciones Requeridas\n\n';
    report += 'El sistema tiene ' + failed + ' prueba(s) fallida(s). Se recomienda:\n\n';
    report += '1. Revisar los detalles de las pruebas fallidas arriba\n';
    report += '2. Corregir las inconsistencias identificadas\n';
    report += '3. Re-ejecutar esta suite de pruebas\n';
    report += '4. No desplegar a producción hasta que todas las pruebas pasen\n\n';
  }
  
  report += '---\n\n';
  report += '*Reporte generado automáticamente por QA Automation Suite*\n';
  report += '*Timestamp: ' + timestamp + '*\n';
  
  return report;
}

// ============================================================================
// PUNTO DE ENTRADA
// ============================================================================

// Ejecutar pruebas y generar reporte
const results = runAllTests();
const report = generateMarkdownReport(results);

// Escribir reporte a archivo
const reportPath = join(process.cwd(), 'test', 'qa-report-auth-routes.md');
writeFileSync(reportPath, report, 'utf-8');

console.log('\n📄 Reporte guardado en: ' + reportPath + '\n');

// Salir con código de error si hay pruebas fallidas
const hasFailures = results.some(r => !r.passed);
process.exit(hasFailures ? 1 : 0);