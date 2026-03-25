import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const crearDocumentoPDF = (cotizacion, configuracion, clientes, servicios) => {
  const doc = new jsPDF(); 
  const clienteObjeto = clientes.find(c => c.id === cotizacion.cliente);
  const nombreCliente = clienteObjeto ? clienteObjeto.nombre_empresa : 'Desconocido';
  
  const logo = new Image(); 
  logo.src = configuracion.logoUrl || '/logo.png'; 
  doc.addImage(logo, 'PNG', 14, 10, 35, 12); 
  
  doc.setFontSize(10); doc.setTextColor(100, 100, 100); 
  doc.text(configuracion.nombre, 195, 15, { align: "right" }); 
  doc.text(configuracion.direccion, 195, 20, { align: "right" }); 
  doc.text(configuracion.telefono, 195, 25, { align: "right" });

  doc.setFontSize(20); doc.setTextColor(15, 23, 42); doc.text("COTIZACIÓN DE SERVICIOS", 14, 40); 
  doc.setFontSize(11); doc.setTextColor(75, 85, 99); 
  doc.text(`Documento N°: ${cotizacion.codigo}`, 14, 50); 
  doc.text(`Fecha: ${new Date(cotizacion.fecha_creacion).toLocaleDateString()}`, 14, 56); 
  doc.text(`Para:`, 14, 66); 
  doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42); doc.text(nombreCliente, 14, 72); doc.setFont("helvetica", "normal");
  
  let subtotalGeneral = 0;
  const datosTabla = cotizacion.detalles.map((d, i) => { 
    const sNombre = servicios.find(s => s.id === d.servicio)?.nombre || 'Servicio'; 
    const sTotal = parseFloat(d.precio_unitario) * d.cantidad; subtotalGeneral += sTotal; 
    return [ i + 1, sNombre, `${configuracion.moneda} ${parseFloat(d.precio_unitario).toLocaleString('en-US', {minimumFractionDigits: 2})}`, d.cantidad, `${configuracion.moneda} ${sTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}` ]; 
  });
  
  autoTable(doc, { startY: 85, head: [['#', 'Servicio', 'Precio Unit.', 'Cant.', 'Subtotal']], body: datosTabla, theme: 'striped', headStyles: { fillColor: [15, 23, 42] } });
  
  const finalY = doc.lastAutoTable.finalY || 85; 
  
  // MATEMÁTICA DEL DESCUENTO
  const porcentajeDescuento = parseFloat(cotizacion.descuento || 0);
  const montoDescuento = subtotalGeneral * (porcentajeDescuento / 100);
  const subtotalConDescuento = subtotalGeneral - montoDescuento;
  const impuesto = subtotalConDescuento * (configuracion.impuesto / 100); 
  const totalFinal = subtotalConDescuento + impuesto;
  
  doc.setFontSize(10); doc.setTextColor(75, 85, 99); 
  let currentY = finalY + 10;

  doc.text(`Subtotal:`, 165, currentY, { align: "right" }); doc.text(`${configuracion.moneda} ${subtotalGeneral.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 196, currentY, { align: "right" }); 
  currentY += 6;

  if (porcentajeDescuento > 0) {
      doc.setTextColor(22, 163, 74); // Verde
      doc.text(`Descuento (${porcentajeDescuento}%):`, 165, currentY, { align: "right" }); 
      doc.text(`-${configuracion.moneda} ${montoDescuento.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 196, currentY, { align: "right" }); 
      currentY += 6;
      doc.setTextColor(75, 85, 99); // Vuelve a gris
  }

  doc.text(`Impuesto (${configuracion.impuesto}%):`, 165, currentY, { align: "right" }); doc.text(`${configuracion.moneda} ${impuesto.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 196, currentY, { align: "right" }); 
  currentY += 8;

  doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42); 
  doc.text(`TOTAL:`, 165, currentY, { align: "right" }); doc.text(`${configuracion.moneda} ${totalFinal.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 196, currentY, { align: "right" }); 
  
  doc.setFontSize(10); doc.setTextColor(100, 100, 100); doc.setFont("helvetica", "normal");
  const lineasDeNotas = doc.splitTextToSize(configuracion.notasPdf, 180); 
  doc.text(lineasDeNotas, 14, currentY + 15);
  
  return { doc, nombreCliente };
};