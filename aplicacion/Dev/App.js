import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

export default function App() {
  //estado para la navegación inferior (0: Escáner, 1: Personal, 2: Ajustes)
  const [tabActiva, setTabActiva] = useState(0);

  //logica de escaner
  const [alumno, setAlumno] = useState(null); 
  const [escaneando, setEscaneando] = useState(false);

  //inicializar nfc
  useEffect(() => {
    async function initNfc() {
      try {
        const supported = await NfcManager.isSupported();
        if (supported) {
          await NfcManager.start();
        } else {
          Alert.alert("Aviso", "Tu dispositivo no soporta NFC.");
        }
      } catch (ex) {
        console.warn("Error iniciando NFC:", ex);
      }
    }
    initNfc();

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => 0);
    };
  }, []);

  //lectura nfc real
  const leerNFC = async () => {
    try {
      setEscaneando(true);
      
      //solicitar tecnologia (ndef o nfca para mayor compatibilidad)
      await NfcManager.requestTechnology(NfcTech.Ndef).catch(() => 
         NfcManager.requestTechnology(NfcTech.NfcA)
      );

      const tag = await NfcManager.getTag();
      console.log("Tag encontrado:", tag);

      //mostrar id del nfc (esto sustituye a la DB demo por ahora)
      setAlumno({
        nombre: 'Tarjeta Detectada',
        curso: 'ID: ' + (tag.id || 'Desconocido'),
        autorizado: true //por defecto true para ver la ficha verde
      });

    } catch (ex) {
      console.warn("Lectura cancelada o error:", ex);
    } finally {
      //IMPORTANTE: cerrar siempre la petición
      NfcManager.cancelTechnologyRequest();
      setEscaneando(false);
    }
  };

  const reiniciar = () => {
    setAlumno(null);
    setEscaneando(false);
  };

  //segun pestaña
  const renderContent = () => {
    
    //lectura
    if (tabActiva === 0) {
      if (!alumno) {
        return (
          <View style={styles.cajaBlanca}>
            <View style={[styles.circuloIcono, escaneando && styles.circuloIconoActivo]}>
              <Ionicons 
                name={escaneando ? "hourglass-outline" : "radio-outline"} 
                size={80} 
                color={escaneando ? "#15803D" : "#2563EB"} 
                style={!escaneando && { transform: [{ rotate: '90deg' }] }}
              />
            </View>
            
            <Text style={styles.tituloVacio}>
              {escaneando ? "Leyendo chip..." : "Modo Lectura NFC"}
            </Text>
            <Text style={styles.subtituloVacio}>
              {escaneando 
                ? "Mantén el dispositivo cerca..." 
                : "Pulsa para leer el número de serie de una tarjeta NFC."}
            </Text>

            {!escaneando && (
              <TouchableOpacity style={styles.botonGrande} onPress={leerNFC}>
                <Ionicons name="radio" size={30} color="white" style={{marginRight: 10, transform: [{ rotate: '90deg' }]}} />
                <Text style={styles.textoBotonGrande}>Leer tarjeta</Text>
              </TouchableOpacity>
            )}

            {escaneando && (
              <TouchableOpacity style={[styles.botonGrande, {backgroundColor: '#EF4444'}]} onPress={() => {
                NfcManager.cancelTechnologyRequest();
                setEscaneando(false);
              }}>
                <Text style={styles.textoBotonGrande}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      } else {
        //ficha alumno (resultado nfc)
        return (
          <>
            <View style={styles.tarjeta}>
              <View style={[styles.avatar, !alumno.autorizado && {borderColor: '#EF4444'}]}>
                <Ionicons name="person" size={60} color="#9CA3AF" />
              </View>

              <Text style={styles.nombreAlumno}>{alumno.nombre}</Text>
              <Text style={styles.cursoAlumno}>{alumno.curso}</Text>

              {alumno.autorizado ? (
                <View style={styles.badgeExito}>
                  <Ionicons name="checkmark-circle" size={24} color="#15803D" style={{marginRight: 8}} />
                  <Text style={styles.textoExito}>LEÍDO</Text>
                </View>
              ) : (
                <View style={styles.badgeError}>
                  <Ionicons name="close-circle" size={24} color="#DC2626" style={{marginRight: 8}} />
                  <Text style={styles.textoError}>ERROR</Text>
                </View>
              )}

              <Text style={styles.textoEstado}>
                Número de serie capturado correctamente
              </Text>
            </View>

            <TouchableOpacity style={styles.botonSiguiente} onPress={reiniciar}>
              <Ionicons name="arrow-forward" size={24} color="white" style={{marginRight: 10}} />
              <Text style={styles.textoBotonSiguiente}>Leer Siguiente</Text>
            </TouchableOpacity>
          </>
        );
      }
    }

    //lista de alumnos (por hacer)
    if (tabActiva === 1) {
      return (
        <View style={styles.cajaVacia}>
          <Ionicons name="construct-outline" size={60} color="#9CA3AF" />
          <Text style={styles.textoConstruccion}>Lista de alumnos</Text>
        </View>
      );
    }

    //vista de ajustes (por hacer)
    if (tabActiva === 2) {
      return (
        <View style={styles.cajaVacia}>
          <Ionicons name="settings-outline" size={60} color="#9CA3AF" />
          <Text style={styles.textoConstruccion}>Ajustes</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#2563EB" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Control Guardia</Text>
        <Text style={styles.headerSubtitle}>IES San Juan de la Rambla</Text>
      </View>

      {/* CONTENIDO PRINCIPAL (Variable según estado) */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* FOOTER / NAVEGACIÓN */}
      <View style={styles.footer}>
        {/* PESTAÑA 0: ESCÁNER */}
        <TouchableOpacity onPress={() => setTabActiva(0)} style={styles.tabItem}>
          <Ionicons 
            name="radio" 
            size={28} 
            color={tabActiva === 0 ? "#2563EB" : "#9CA3AF"} 
            style={{ transform: [{ rotate: '90deg' }] }} 
          />
          {tabActiva === 0 && <View style={styles.puntoActivo} />}
        </TouchableOpacity>

        {/* PESTAÑA 1: ALUMNOS */}
        <TouchableOpacity onPress={() => setTabActiva(1)} style={styles.tabItem}>
          <Ionicons 
            name="people" 
            size={28} 
            color={tabActiva === 1 ? "#2563EB" : "#9CA3AF"} 
          />
          {tabActiva === 1 && <View style={styles.puntoActivo} />}
        </TouchableOpacity>

        {/* PESTAÑA 2: AJUSTES */}
        <TouchableOpacity onPress={() => setTabActiva(2)} style={styles.tabItem}>
          <Ionicons 
            name="settings" 
            size={28} 
            color={tabActiva === 2 ? "#2563EB" : "#9CA3AF"} 
          />
          {tabActiva === 2 && <View style={styles.puntoActivo} />}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },

  header: {
    backgroundColor: '#2563EB',
    padding: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    zIndex: 10,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 4,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: -30, 
  },


  //ESTILOS PANTALLA INICIO
  cajaBlanca: {
    backgroundColor: 'white',
    width: '100%',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  circuloIcono: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  circuloIconoActivo: {
    backgroundColor: '#DCFCE7',
  },

  tituloVacio: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },

  subtituloVacio: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },

  botonGrande: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoBotonGrande: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },


  // ESTILOS TARJETA ALUMNO
  tarjeta: {
    backgroundColor: 'white',
    width: '100%',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },

  nombreAlumno: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },

  cursoAlumno: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },

  badgeExito: {
    flexDirection: 'row',
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },

  textoExito: {
    color: '#15803D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  badgeError: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },

  textoError: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 16,
  },

  textoEstado: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  botonSiguiente: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  textoBotonSiguiente: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },


  // ESTILOS DE PESTAÑAS VACÍAS
  cajaVacia: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },

  textoConstruccion: {
    marginTop: 10,
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },


  // FOOTER ACTUALIZADO
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },

  puntoActivo: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2563EB',
    marginTop: 4,
  }
});