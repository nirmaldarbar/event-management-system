import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import moment from 'moment';

// Builds a PDF with one pass per attendee (or per ticket if no names were entered).
// The QR code carries the booking's ticket number, which the organizer scans at the gate.
export async function downloadPass(booking) {
  const event = booking.event || {};
  const total = Math.max(booking.quantity || 1, booking.attendees?.length || 0, 1);
  const qr = await QRCode.toDataURL(booking.ticketNumber || String(booking._id), { margin: 1, width: 320 });

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [210, 80] });

  for (let i = 0; i < total; i++) {
    if (i > 0) doc.addPage([210, 80], 'landscape');
    const attendee = booking.attendees?.[i];

    // Frame + coloured stub
    doc.setFillColor(255, 255, 255).rect(0, 0, 210, 80, 'F');
    doc.setDrawColor(17, 17, 17).setLineWidth(0.9).rect(4, 4, 202, 72);
    doc.setFillColor(255, 225, 77).rect(4, 4, 8, 72, 'F');
    doc.rect(4, 4, 8, 72);
    doc.setLineDashPattern([2, 2], 0).line(150, 4, 150, 76).setLineDashPattern([], 0);

    // Brand
    doc.setTextColor(17, 17, 17).setFont('helvetica', 'bold').setFontSize(9).text('EVENTHUB  |  ADMIT ONE', 18, 14);

    // Title
    doc.setFontSize(20);
    const title = doc.splitTextToSize(event.title || 'Event', 126).slice(0, 2);
    doc.text(title, 18, 26);

    // Details
    doc.setFontSize(10).setFont('helvetica', 'normal');
    const y = 26 + title.length * 8 + 4;
    const when = event.startDate ? moment(event.startDate).format('ddd, D MMM YYYY • h:mm A') : '';
    const where = event.isOnline ? 'Online event' : [event.venue?.name, event.venue?.address?.city].filter(Boolean).join(', ');
    doc.text(`When:   ${when}`, 18, y);
    doc.text(`Where:  ${where}`, 18, y + 6);
    doc.text(`Ticket: ${booking.ticketType?.name || 'General Admission'}`, 18, y + 12);
    doc.text(`Holder: ${attendee?.name || 'Guest'}${attendee?.email ? '  (' + attendee.email + ')' : ''}`, 18, y + 18);

    doc.setFont('helvetica', 'bold').setFontSize(9);
    doc.text(`Pass ${i + 1} of ${total}`, 18, 71);

    // QR stub
    doc.addImage(qr, 'PNG', 160, 10, 40, 40);
    doc.setFontSize(9).text(booking.ticketNumber || '', 180, 56, { align: 'center' });
    doc.setFont('helvetica', 'normal').setFontSize(7).text('Show this QR at the entry gate', 180, 62, { align: 'center' });
  }

  doc.save(`EventHub-pass-${booking.ticketNumber || booking._id}.pdf`);
}
