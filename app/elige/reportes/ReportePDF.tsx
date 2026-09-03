import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { ResumenGlobal, UAMetrica } from './actions'

// 1. Desactivar el hyphenación automática
Font.registerHyphenationCallback((word) => [word])

// 2. URLs de las fuentes Roboto en CDN público
const ROBOTO_URLS = {
  normal: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
  bold: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
  italic: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf',
  boldItalic: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf',
}

// 3. Registrar familia Roboto completa
Font.register({
  family: 'Roboto',
  fonts: [
    { src: ROBOTO_URLS.normal, fontWeight: 'normal', fontStyle: 'normal' },
    { src: ROBOTO_URLS.bold, fontWeight: 'bold', fontStyle: 'normal' },
    { src: ROBOTO_URLS.italic, fontWeight: 'normal', fontStyle: 'italic' },
    { src: ROBOTO_URLS.boldItalic, fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

// 4. Registrar familia Helvetica como alias de Roboto
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: ROBOTO_URLS.normal, fontWeight: 'normal', fontStyle: 'normal' },
    { src: ROBOTO_URLS.bold, fontWeight: 'bold', fontStyle: 'normal' },
    { src: ROBOTO_URLS.italic, fontWeight: 'normal', fontStyle: 'italic' },
    { src: ROBOTO_URLS.boldItalic, fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

// 5. Registrar variantes individuales de Helvetica para fallback
Font.register({ family: 'Helvetica-Bold', src: ROBOTO_URLS.bold })
Font.register({ family: 'Helvetica-Oblique', src: ROBOTO_URLS.italic })
Font.register({ family: 'Helvetica-BoldOblique', src: ROBOTO_URLS.boldItalic })

// 6. Estilos
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#334155',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Roboto',
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0f172a',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 6,
  },
  colHeader: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#475569',
  },
  label: {
    fontFamily: 'Roboto',
    flex: 1,
  },
  value: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  currency: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#059669',
  },
})

interface Props {
  global: ResumenGlobal
  uas: UAMetrica[]
  fechaGeneracion: string
}

function fmt(n: number): string {
  return new Intl.NumberFormat('es-MX').format(n)
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

export function ReportePDF({ global, uas, fechaGeneracion }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Reporte del Congreso IGE 2026</Text>
          <Text style={styles.subtitle}>Fecha de generacion: {fechaGeneracion}</Text>
        </View>

        {/* Métricas Globales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Global</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Total Boletos Vendidos:</Text>
            <Text style={styles.value}>{fmt(global.totalTickets)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>- Alumnos ({global.porcentajeAlumnos}%):</Text>
            <Text style={styles.value}>{fmt(global.totalAlumnos)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>- Empresas ({global.porcentajeEmpresas}%):</Text>
            <Text style={styles.value}>{fmt(global.totalEmpresas)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>- Docentes ({global.porcentajeDocentes}%):</Text>
            <Text style={styles.value}>{fmt(global.totalDocentes)}</Text>
          </View>
        </View>

        {/* Ingresos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingresos</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Ingresos Totales:</Text>
            <Text style={styles.currency}>{fmtCurrency(global.ingresosTotales)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ingresos por Investigacion:</Text>
            <Text style={styles.currency}>{fmtCurrency(global.ingresosPorInvestigacion)}</Text>
          </View>
        </View>

        {/* Asistencias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asistencias</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Dia 1:</Text>
            <Text style={styles.value}>{fmt(global.asistenciasDia1)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dia 2:</Text>
            <Text style={styles.value}>{fmt(global.asistenciasDia2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Asistencias:</Text>
            <Text style={styles.value}>{fmt(global.totalAsistencias)}</Text>
          </View>
        </View>

        {/* Investigación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articulos de Investigacion</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Articulos Aceptados:</Text>
            <Text style={styles.value}>{fmt(global.articulosAceptados)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Articulos Pendientes:</Text>
            <Text style={styles.value}>{fmt(global.articulosPendientes)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Articulos:</Text>
            <Text style={styles.value}>{fmt(global.totalArticulos)}</Text>
          </View>
        </View>

        {/* Zona Top */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona con Mas Ventas</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Zona:</Text>
            <Text style={styles.value}>{global.zonaTop}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tickets Vendidos:</Text>
            <Text style={styles.value}>{fmt(global.zonaTopTickets)}</Text>
          </View>
        </View>

        {/* Desglose por UA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desglose por Unidad Academica</Text>
          <View style={[styles.row, { backgroundColor: '#f8fafc' }]}>
            <Text style={[{ flex: 2 }, styles.colHeader]}>Unidad Academica</Text>
            <Text style={[{ flex: 1 }, styles.colHeader]}>Tickets</Text>
            <Text style={[{ flex: 1 }, styles.colHeader]}>%</Text>
            <Text style={[{ flex: 1 }, styles.colHeader]}>Ingresos</Text>
          </View>
          {uas.map((ua, index) => (
            <View key={index} style={styles.row}>
              <Text style={{ flex: 2, fontFamily: 'Roboto' }}>{ua.nombre}</Text>
              <Text style={{ flex: 1, fontFamily: 'Roboto' }}>{fmt(ua.totalTickets)}</Text>
              <Text style={{ flex: 1, fontFamily: 'Roboto' }}>{ua.porcentaje}%</Text>
              <Text style={{ flex: 1, fontFamily: 'Roboto', fontWeight: 'bold', color: '#059669' }}>
                {fmtCurrency(ua.ingresos)}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}
