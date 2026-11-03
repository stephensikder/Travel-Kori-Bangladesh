// ===================================================
// TRAVEL KORI BANGLADESH - OFFICIAL PDF TICKET & REPORT GENERATOR
// Produces 100% valid, standalone binary PDF-1.4 documents
// Aligned with Sections I, M, N, O (Transport, Hotel, Guide, Reports)
// ===================================================

(function (window) {
    "use strict";

    // ----------------------------------------------------
    // Pure JavaScript PDF-1.4 Binary Generator
    // ----------------------------------------------------
    function createPdfDocument() {
        const streams = [];

        function escapePdfText(str) {
            if (!str) return "";
            return String(str)
                .replace(/\\/g, "\\\\")
                .replace(/\(/g, "\\(")
                .replace(/\)/g, "\\)")
                .replace(/[^\x20-\x7E]/g, "?");
        }

        function hexToRgb(hex) {
            const clean = (hex || "#000000").replace("#", "");
            const r = parseInt(clean.substring(0, 2), 16) / 255;
            const g = parseInt(clean.substring(2, 4), 16) / 255;
            const b = parseInt(clean.substring(4, 6), 16) / 255;
            return {
                r: (isNaN(r) ? 0 : r).toFixed(3),
                g: (isNaN(g) ? 0 : g).toFixed(3),
                b: (isNaN(b) ? 0 : b).toFixed(3)
            };
        }

        const doc = {
            width: 595.28,
            height: 841.89,

            drawRect: function (x, y, w, h, fillColor, strokeColor, lineWidth) {
                let cmd = "";
                if (fillColor) {
                    const c = hexToRgb(fillColor);
                    cmd += `${c.r} ${c.g} ${c.b} rg\n`;
                }
                if (strokeColor) {
                    const sc = hexToRgb(strokeColor);
                    cmd += `${sc.r} ${sc.g} ${sc.b} RG\n`;
                    cmd += `${lineWidth || 1} w\n`;
                }
                cmd += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re\n`;
                if (fillColor && strokeColor) cmd += "B\n";
                else if (fillColor) cmd += "f\n";
                else if (strokeColor) cmd += "S\n";
                streams.push(cmd);
            },

            drawLine: function (x1, y1, x2, y2, color, lineWidth) {
                const c = hexToRgb(color || "#cbd5e1");
                const lw = lineWidth || 1;
                streams.push(`${c.r} ${c.g} ${c.b} RG\n${lw} w\n${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S\n`);
            },

            drawText: function (text, x, y, options) {
                const opt = options || {};
                const font = opt.font || "/F1";
                const size = opt.size || 11;
                const color = hexToRgb(opt.color || "#17382f");
                const escaped = escapePdfText(text);
                streams.push(`BT\n${font} ${size} Tf\n${color.r} ${color.g} ${color.b} rg\n${x.toFixed(2)} ${y.toFixed(2)} Td\n(${escaped}) Tj\nET\n`);
            },

            download: function (filename) {
                const contentBody = streams.join("");
                const contentStreamLength = contentBody.length;

                const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n";
                const obj2 = "2 0 obj\n<< /Type /Outlines /Count 0 >>\nendobj\n";
                const obj3 = "3 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj\n";
                const obj4 = `4 0 obj\n<< /Type /Page /Parent 3 0 R /MediaBox [0 0 595.28 841.89] /Contents 8 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>\nendobj\n`;
                const obj5 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /Name /F1 /BaseFont /Helvetica >>\nendobj\n";
                const obj6 = "6 0 obj\n<< /Type /Font /Subtype /Type1 /Name /F2 /BaseFont /Helvetica-Bold >>\nendobj\n";
                const obj7 = "7 0 obj\n<< /Type /Font /Subtype /Type1 /Name /F3 /BaseFont /Courier-Bold >>\nendobj\n";
                const obj8 = `8 0 obj\n<< /Length ${contentStreamLength} >>\nstream\n${contentBody}\nendstream\nendobj\n`;

                const allObjs = [obj1, obj2, obj3, obj4, obj5, obj6, obj7, obj8];

                let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
                const xref = ["xref\n0 9\n0000000000 65535 f \n"];

                for (let i = 0; i < allObjs.length; i++) {
                    const offset = pdf.length;
                    const offsetStr = String(offset).padStart(10, "0");
                    xref.push(`${offsetStr} 00000 n \n`);
                    pdf += allObjs[i];
                }

                const startXref = pdf.length;
                pdf += xref.join("");
                pdf += `trailer\n<< /Size 9 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

                const buffer = new Uint8Array(pdf.length);
                for (let i = 0; i < pdf.length; i++) {
                    buffer[i] = pdf.charCodeAt(i) & 0xff;
                }

                const blob = new Blob([buffer], { type: "application/pdf" });
                const blobUrl = URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = filename;
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);
                }, 1000);
            }
        };

        return doc;
    }

    // ----------------------------------------------------
    // 1. GENERATE TRANSPORT TICKET PDF
    // ----------------------------------------------------
    function generateTransportTicketPDF(booking) {
        if (!booking) return;

        const id = booking.reference || booking._id || booking.id || ("TKB-" + Date.now().toString().slice(-6));
        const origin = booking.from || booking.journey?.from || "Dhaka";
        const destination = booking.to || booking.journey?.to || "Cox's Bazar";
        const type = (booking.type || booking.journey?.type || booking.transportType || "Bus").toUpperCase();
        const operator = booking.operator || booking.journey?.operator || "Green Line Paribahan";
        const journeyDate = booking.journeyDate || booking.date || new Date().toISOString().split("T")[0];
        const passengerName = booking.passengerName || booking.guestName || "Stephen Sikder";
        const passengerPhone = booking.passengerPhone || booking.guestPhone || "+8801700000000";
        const seats = Array.isArray(booking.seatNumbers) ? booking.seatNumbers.join(", ") : (booking.seats || "A1");
        const passengersCount = String(booking.passengers || 1);
        const paymentMethod = String(booking.paymentMethod || booking.payment?.method || "bKash (Demo)").toUpperCase();
        const totalFare = Number(booking.totalPrice || booking.totalFare || 1400).toLocaleString("en-BD");

        const doc = createPdfDocument();
        const marginX = 40;
        const width = 515;
        const boxTop = 790;
        const boxHeight = 490;
        const boxBottom = boxTop - boxHeight;

        doc.drawRect(marginX, boxBottom, width, boxHeight, "#ffffff", "#087f5b", 2);
        doc.drawRect(marginX, boxTop - 65, width, 65, "#087f5b", null, 0);

        doc.drawRect(marginX + 15, boxTop - 50, 36, 36, "#ffffff", null, 0);
        doc.drawText("TK", marginX + 23, boxTop - 36, { font: "/F2", size: 16, color: "#087f5b" });
        doc.drawText("TRAVEL KORI BANGLADESH", marginX + 60, boxTop - 32, { font: "/F2", size: 17, color: "#ffffff" });
        doc.drawText("Official Electronic Ticket & Boarding Pass", marginX + 60, boxTop - 48, { font: "/F1", size: 10, color: "#e6f7f0" });

        doc.drawText("CONFIRMED TICKET", marginX + width - 140, boxTop - 32, { font: "/F2", size: 10, color: "#ffffff" });
        doc.drawText(`REF: ${id}`, marginX + width - 140, boxTop - 48, { font: "/F3", size: 9, color: "#e6f7f0" });

        const routeY = boxTop - 130;
        doc.drawRect(marginX + 15, routeY, width - 30, 50, "#f0f7f3", "#b5e8d5", 1);
        doc.drawText("FROM / ORIGIN", marginX + 30, routeY + 34, { font: "/F2", size: 9, color: "#62766d" });
        doc.drawText(origin.toUpperCase(), marginX + 30, routeY + 14, { font: "/F2", size: 16, color: "#17382f" });

        doc.drawText(`>>>  ${type} SERVICE  >>>`, marginX + 200, routeY + 22, { font: "/F2", size: 11, color: "#087f5b" });

        doc.drawText("TO / DESTINATION", marginX + 360, routeY + 34, { font: "/F2", size: 9, color: "#62766d" });
        doc.drawText(destination.toUpperCase(), marginX + 360, routeY + 14, { font: "/F2", size: 16, color: "#17382f" });

        const tableY = routeY - 20;
        doc.drawRect(marginX + 15, tableY - 180, width - 30, 180, "#ffffff", "#e2e8f0", 1);
        doc.drawLine(marginX + 15, tableY - 45, marginX + width - 15, tableY - 45, "#e2e8f0", 1);
        doc.drawLine(marginX + 15, tableY - 90, marginX + width - 15, tableY - 90, "#e2e8f0", 1);
        doc.drawLine(marginX + 15, tableY - 135, marginX + width - 15, tableY - 135, "#e2e8f0", 1);
        doc.drawLine(marginX + 260, tableY, marginX + 260, tableY - 180, "#e2e8f0", 1);

        doc.drawText("PASSENGER NAME", marginX + 25, tableY - 18, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(passengerName, marginX + 25, tableY - 34, { font: "/F2", size: 12, color: "#17382f" });
        doc.drawText("CONTACT PHONE", marginX + 275, tableY - 18, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(passengerPhone, marginX + 275, tableY - 34, { font: "/F2", size: 12, color: "#17382f" });

        doc.drawText("OPERATOR & SERVICE", marginX + 25, tableY - 63, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(operator, marginX + 25, tableY - 79, { font: "/F2", size: 12, color: "#17382f" });
        doc.drawText("TRAVEL DATE", marginX + 275, tableY - 63, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(journeyDate, marginX + 275, tableY - 79, { font: "/F2", size: 12, color: "#087f5b" });

        doc.drawText("ALLOCATED SEATS", marginX + 25, tableY - 108, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(`Seat(s): ${seats} (${passengersCount} Pax)`, marginX + 25, tableY - 124, { font: "/F2", size: 12, color: "#087f5b" });
        doc.drawText("PAYMENT METHOD", marginX + 275, tableY - 108, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(paymentMethod, marginX + 275, tableY - 124, { font: "/F2", size: 12, color: "#17382f" });

        doc.drawText("BOARDING ADVISORY", marginX + 25, tableY - 153, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText("Arrive 20 mins before departure", marginX + 25, tableY - 169, { font: "/F1", size: 11, color: "#17382f" });
        doc.drawText("TOTAL FARE", marginX + 275, tableY - 153, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(`BDT ${totalFare}`, marginX + 275, tableY - 169, { font: "/F2", size: 14, color: "#087f5b" });

        const barcodeY = tableY - 215;
        doc.drawLine(marginX + 15, barcodeY + 20, marginX + width - 15, barcodeY + 20, "#cbd5e1", 1);
        doc.drawText("||||| || |||||| ||| |||| | ||| |||||||| |||| ||||||", marginX + 25, barcodeY, { font: "/F3", size: 14, color: "#17382f" });
        doc.drawText(`Verification Code: ${id}  -  Present ticket at boarding counter`, marginX + 25, barcodeY - 16, { font: "/F1", size: 9, color: "#62766d" });

        doc.drawText("Travel Kori Bangladesh • Centralized Tourism & Transport Platform", marginX + 25, boxBottom + 20, { font: "/F2", size: 8, color: "#087f5b" });
        doc.drawText(`Issued: ${new Date().toLocaleDateString("en-GB")}`, marginX + width - 110, boxBottom + 20, { font: "/F1", size: 8, color: "#62766d" });

        const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
        doc.download(`Transport-Ticket-${safeId}.pdf`);
    }

    // ----------------------------------------------------
    // 2. GENERATE HOTEL BOOKING VOUCHER PDF
    // ----------------------------------------------------
    function generateHotelVoucherPDF(booking) {
        if (!booking) return;

        const id = booking.reference || booking._id || booking.id || ("TKH-" + Date.now().toString().slice(-6));
        const hotelName = booking.hotelName || booking.hotel?.name || "Dhaka Comfort Stay";
        const district = booking.district || booking.hotel?.district || "Dhaka";
        const roomType = booking.roomType || "Standard Room";
        const rooms = String(booking.rooms || 1);
        const nights = String(booking.nights || 1);
        const checkIn = booking.checkIn || new Date().toISOString().split("T")[0];
        const checkOut = booking.checkOut || new Date(Date.now() + 86400000).toISOString().split("T")[0];
        const guestName = booking.guestName || "Stephen Sikder";
        const guestPhone = booking.guestPhone || "+8801700000000";
        const payStatus = booking.paymentStatus || (booking.payment?.status?.includes("Pending") ? "Payment Pending (Pay at Hotel)" : "Paid (Demo)");
        const totalPrice = Number(booking.totalPrice || 2500).toLocaleString("en-BD");

        const doc = createPdfDocument();
        const marginX = 40;
        const width = 515;
        const boxTop = 790;
        const boxHeight = 490;
        const boxBottom = boxTop - boxHeight;

        doc.drawRect(marginX, boxBottom, width, boxHeight, "#ffffff", "#087f5b", 2);
        doc.drawRect(marginX, boxTop - 65, width, 65, "#087f5b", null, 0);

        doc.drawRect(marginX + 15, boxTop - 50, 36, 36, "#ffffff", null, 0);
        doc.drawText("TK", marginX + 23, boxTop - 36, { font: "/F2", size: 16, color: "#087f5b" });
        doc.drawText("TRAVEL KORI BANGLADESH", marginX + 60, boxTop - 32, { font: "/F2", size: 17, color: "#ffffff" });
        doc.drawText("Official Hotel Booking Voucher & Accommodation Confirmation", marginX + 60, boxTop - 48, { font: "/F1", size: 10, color: "#e6f7f0" });

        doc.drawText("CONFIRMED STAY", marginX + width - 140, boxTop - 32, { font: "/F2", size: 10, color: "#ffffff" });
        doc.drawText(`REF: ${id}`, marginX + width - 140, boxTop - 48, { font: "/F3", size: 9, color: "#e6f7f0" });

        const hotelY = boxTop - 130;
        doc.drawRect(marginX + 15, hotelY, width - 30, 50, "#f0f7f3", "#b5e8d5", 1);
        doc.drawText("ACCOMMODATION PROPERTY", marginX + 30, hotelY + 34, { font: "/F2", size: 9, color: "#62766d" });
        doc.drawText(hotelName.toUpperCase(), marginX + 30, hotelY + 14, { font: "/F2", size: 15, color: "#17382f" });

        doc.drawText("DISTRICT LOCATION", marginX + 360, hotelY + 34, { font: "/F2", size: 9, color: "#62766d" });
        doc.drawText(district.toUpperCase(), marginX + 360, hotelY + 14, { font: "/F2", size: 15, color: "#087f5b" });

        const tableY = hotelY - 20;
        doc.drawRect(marginX + 15, tableY - 180, width - 30, 180, "#ffffff", "#e2e8f0", 1);
        doc.drawLine(marginX + 15, tableY - 45, marginX + width - 15, tableY - 45, "#e2e8f0", 1);
        doc.drawLine(marginX + 15, tableY - 90, marginX + width - 15, tableY - 90, "#e2e8f0", 1);
        doc.drawLine(marginX + 15, tableY - 135, marginX + width - 15, tableY - 135, "#e2e8f0", 1);
        doc.drawLine(marginX + 260, tableY, marginX + 260, tableY - 180, "#e2e8f0", 1);

        doc.drawText("GUEST NAME", marginX + 25, tableY - 18, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(guestName, marginX + 25, tableY - 34, { font: "/F2", size: 12, color: "#17382f" });
        doc.drawText("CONTACT PHONE", marginX + 275, tableY - 18, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(guestPhone, marginX + 275, tableY - 34, { font: "/F2", size: 12, color: "#17382f" });

        doc.drawText("CHECK-IN DATE", marginX + 25, tableY - 63, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(checkIn, marginX + 25, tableY - 79, { font: "/F2", size: 12, color: "#087f5b" });
        doc.drawText("CHECK-OUT DATE", marginX + 275, tableY - 63, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(checkOut, marginX + 275, tableY - 79, { font: "/F2", size: 12, color: "#087f5b" });

        doc.drawText("ROOM TYPE & STAY", marginX + 25, tableY - 108, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(`${roomType} (${rooms} Room, ${nights} Night)`, marginX + 25, tableY - 124, { font: "/F2", size: 12, color: "#17382f" });
        doc.drawText("PAYMENT STATUS", marginX + 275, tableY - 108, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(payStatus, marginX + 275, tableY - 124, { font: "/F2", size: 11, color: "#17382f" });

        doc.drawText("CHECK-IN POLICY", marginX + 25, tableY - 153, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText("Standard Check-in 12:00 PM • Check-out 11:00 AM", marginX + 25, tableY - 169, { font: "/F1", size: 10, color: "#17382f" });
        doc.drawText("TOTAL CHARGES", marginX + 275, tableY - 153, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(`BDT ${totalPrice}`, marginX + 275, tableY - 169, { font: "/F2", size: 14, color: "#087f5b" });

        const barcodeY = tableY - 215;
        doc.drawLine(marginX + 15, barcodeY + 20, marginX + width - 15, barcodeY + 20, "#cbd5e1", 1);
        doc.drawText("||||| || |||||| ||| |||| | ||| |||||||| |||| ||||||", marginX + 25, barcodeY, { font: "/F3", size: 14, color: "#17382f" });
        doc.drawText(`Verification Code: ${id}  -  Present this voucher at hotel front desk`, marginX + 25, barcodeY - 16, { font: "/F1", size: 9, color: "#62766d" });

        doc.drawText("Travel Kori Bangladesh • Official Hospitality Network", marginX + 25, boxBottom + 20, { font: "/F2", size: 8, color: "#087f5b" });
        doc.drawText(`Issued: ${new Date().toLocaleDateString("en-GB")}`, marginX + width - 110, boxBottom + 20, { font: "/F1", size: 8, color: "#62766d" });

        const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
        doc.download(`Hotel-Booking-${safeId}.pdf`);
    }

    // ----------------------------------------------------
    // 3. GENERATE TOUR GUIDE VOUCHER PDF
    // ----------------------------------------------------
    function generateGuideVoucherPDF(booking) {
        if (!booking) return;

        const id = booking.reference || booking._id || ("TKG-" + Date.now().toString().slice(-6));
        const guideName = booking.guideName || "Chingmung Marma";
        const district = booking.district || "Bandarban";
        const date = booking.date || booking.serviceDate || new Date().toISOString().split("T")[0];
        const days = String(booking.days || 1);
        const travelerName = booking.travelerName || booking.guestName || "Stephen Sikder";
        const travelerPhone = booking.travelerPhone || "+8801700000000";
        const dailyRate = Number(booking.dailyRate || 3000).toLocaleString("en-BD");
        const totalAmount = Number(booking.totalAmount || booking.totalPrice || 3000).toLocaleString("en-BD");

        const doc = createPdfDocument();
        const marginX = 40;
        const width = 515;
        const boxTop = 790;
        const boxHeight = 490;
        const boxBottom = boxTop - boxHeight;

        doc.drawRect(marginX, boxBottom, width, boxHeight, "#ffffff", "#087f5b", 2);
        doc.drawRect(marginX, boxTop - 65, width, 65, "#087f5b", null, 0);

        doc.drawRect(marginX + 15, boxTop - 50, 36, 36, "#ffffff", null, 0);
        doc.drawText("TK", marginX + 23, boxTop - 36, { font: "/F2", size: 16, color: "#087f5b" });
        doc.drawText("TRAVEL KORI BANGLADESH", marginX + 60, boxTop - 32, { font: "/F2", size: 17, color: "#ffffff" });
        doc.drawText("Official Tour Guide Booking Voucher & Certified Escort Pass", marginX + 60, boxTop - 48, { font: "/F1", size: 10, color: "#e6f7f0" });

        doc.drawText("CONFIRMED GUIDE", marginX + width - 140, boxTop - 32, { font: "/F2", size: 10, color: "#ffffff" });
        doc.drawText(`REF: ${id}`, marginX + width - 140, boxTop - 48, { font: "/F3", size: 9, color: "#e6f7f0" });

        const guideY = boxTop - 130;
        doc.drawRect(marginX + 15, guideY, width - 30, 50, "#f0f7f3", "#b5e8d5", 1);
        doc.drawText("CERTIFIED TOUR GUIDE", marginX + 30, guideY + 34, { font: "/F2", size: 9, color: "#62766d" });
        doc.drawText(guideName.toUpperCase(), marginX + 30, guideY + 14, { font: "/F2", size: 15, color: "#17382f" });

        doc.drawText("ASSIGNED REGION", marginX + 360, guideY + 34, { font: "/F2", size: 9, color: "#62766d" });
        doc.drawText(district.toUpperCase(), marginX + 360, guideY + 14, { font: "/F2", size: 15, color: "#087f5b" });

        const tableY = guideY - 20;
        doc.drawRect(marginX + 15, tableY - 180, width - 30, 180, "#ffffff", "#e2e8f0", 1);
        doc.drawLine(marginX + 15, tableY - 45, marginX + width - 15, tableY - 45, "#e2e8f0", 1);
        doc.drawLine(marginX + 15, tableY - 90, marginX + width - 15, tableY - 90, "#e2e8f0", 1);
        doc.drawLine(marginX + 15, tableY - 135, marginX + width - 15, tableY - 135, "#e2e8f0", 1);
        doc.drawLine(marginX + 260, tableY, marginX + 260, tableY - 180, "#e2e8f0", 1);

        doc.drawText("CLIENT / TRAVELER", marginX + 25, tableY - 18, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(travelerName, marginX + 25, tableY - 34, { font: "/F2", size: 12, color: "#17382f" });
        doc.drawText("CONTACT NUMBER", marginX + 275, tableY - 18, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(travelerPhone, marginX + 275, tableY - 34, { font: "/F2", size: 12, color: "#17382f" });

        doc.drawText("SERVICE DATE", marginX + 25, tableY - 63, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(date, marginX + 25, tableY - 79, { font: "/F2", size: 12, color: "#087f5b" });
        doc.drawText("SERVICE DURATION", marginX + 275, tableY - 63, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(`${days} Day(s) Escorted Tour`, marginX + 275, tableY - 79, { font: "/F2", size: 12, color: "#087f5b" });

        doc.drawText("DAILY REMUNERATION", marginX + 25, tableY - 108, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(`BDT ${dailyRate} / Day`, marginX + 25, tableY - 124, { font: "/F2", size: 12, color: "#17382f" });
        doc.drawText("BOOKING STATUS", marginX + 275, tableY - 108, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText("Confirmed / Assigned", marginX + 275, tableY - 124, { font: "/F2", size: 12, color: "#17382f" });

        doc.drawText("MEETING POINT ADVISORY", marginX + 25, tableY - 153, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText("Guide will coordinate phone meet-up 1 hr prior", marginX + 25, tableY - 169, { font: "/F1", size: 10, color: "#17382f" });
        doc.drawText("TOTAL REMUNERATION", marginX + 275, tableY - 153, { font: "/F1", size: 9, color: "#62766d" });
        doc.drawText(`BDT ${totalAmount}`, marginX + 275, tableY - 169, { font: "/F2", size: 14, color: "#087f5b" });

        const barcodeY = tableY - 215;
        doc.drawLine(marginX + 15, barcodeY + 20, marginX + width - 15, barcodeY + 20, "#cbd5e1", 1);
        doc.drawText("||||| || |||||| ||| |||| | ||| |||||||| |||| ||||||", marginX + 25, barcodeY, { font: "/F3", size: 14, color: "#17382f" });
        doc.drawText(`Verification Code: ${id}  -  Certified Local Tour Guide Services`, marginX + 25, barcodeY - 16, { font: "/F1", size: 9, color: "#62766d" });

        doc.drawText("Travel Kori Bangladesh • Official Tour Guide Network", marginX + 25, boxBottom + 20, { font: "/F2", size: 8, color: "#087f5b" });
        doc.drawText(`Issued: ${new Date().toLocaleDateString("en-GB")}`, marginX + width - 110, boxBottom + 20, { font: "/F1", size: 8, color: "#62766d" });

        const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
        doc.download(`Guide-Booking-${safeId}.pdf`);
    }

    // ----------------------------------------------------
    // 4. GENERATE TRAVELER FULL TRAVEL HISTORY REPORT PDF (Section M)
    // ----------------------------------------------------
    function generateTravelHistoryReportPDF(user, bookings) {
        const u = user || {};
        const userName = u.fullName || u.name || "Stephen Sikder";
        const email = u.email || "steve@gmail.com";
        const phone = u.phone || "+8801700000000";
        const bList = Array.isArray(bookings) ? bookings : [];

        const totalSpent = bList.reduce((sum, b) => sum + (Number(b.totalPrice || b.totalAmount || b.totalFare || 0)), 0);
        const totalTrips = bList.length;

        const doc = createPdfDocument();
        const marginX = 40;
        const width = 515;

        // Header Banner
        doc.drawRect(marginX, 760, width, 60, "#087f5b", null, 0);
        doc.drawText("TRAVEL KORI BANGLADESH", marginX + 20, 795, { font: "/F2", size: 18, color: "#ffffff" });
        doc.drawText("Official Traveler Historical Record & Expenditure Statement", marginX + 20, 775, { font: "/F1", size: 10, color: "#e6f7f0" });

        // User Profile Summary Box
        doc.drawRect(marginX, 680, width, 65, "#f8fafc", "#cbd5e1", 1);
        doc.drawText("TRAVELER PROFILE", marginX + 16, 730, { font: "/F2", size: 9, color: "#64748b" });
        doc.drawText(`Name: ${userName}  •  Email: ${email}  •  Phone: ${phone}`, marginX + 16, 712, { font: "/F2", size: 11, color: "#0f172a" });
        doc.drawText(`Total Bookings: ${totalTrips}  •  Total Cumulative Investment: BDT ${totalSpent.toLocaleString("en-BD")}  •  Account Status: Active Explorer`, marginX + 16, 694, { font: "/F1", size: 10, color: "#087f5b" });

        // Bookings Table Header
        let y = 645;
        doc.drawRect(marginX, y, width, 24, "#0f172a", null, 0);
        doc.drawText("REF #", marginX + 10, y + 8, { font: "/F2", size: 9, color: "#ffffff" });
        doc.drawText("TYPE", marginX + 120, y + 8, { font: "/F2", size: 9, color: "#ffffff" });
        doc.drawText("SERVICE / DESTINATION", marginX + 180, y + 8, { font: "/F2", size: 9, color: "#ffffff" });
        doc.drawText("DATE", marginX + 350, y + 8, { font: "/F2", size: 9, color: "#ffffff" });
        doc.drawText("AMOUNT", marginX + 440, y + 8, { font: "/F2", size: 9, color: "#ffffff" });

        // Rows
        const renderList = bList.slice(0, 15); // Print up to 15 records per summary
        renderList.forEach((b, i) => {
            y -= 26;
            const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
            doc.drawRect(marginX, y, width, 26, bg, "#e2e8f0", 0.5);

            const ref = (b.reference || b._id || "REF").slice(0, 14);
            const bType = (b.bookingType || b.type || (b.hotelName ? "Hotel" : "Transport")).toUpperCase();
            const service = (b.hotelName || (b.from ? `${b.from} -> ${b.to}` : b.guideName) || "Journey").slice(0, 26);
            const dateStr = (b.checkIn || b.journeyDate || b.date || "2026-10-25").slice(0, 10);
            const amt = `BDT ${Number(b.totalPrice || b.totalAmount || 0).toLocaleString("en-BD")}`;

            doc.drawText(ref, marginX + 10, y + 8, { font: "/F3", size: 8, color: "#334155" });
            doc.drawText(bType, marginX + 120, y + 8, { font: "/F2", size: 8, color: "#087f5b" });
            doc.drawText(service, marginX + 180, y + 8, { font: "/F1", size: 8, color: "#0f172a" });
            doc.drawText(dateStr, marginX + 350, y + 8, { font: "/F1", size: 8, color: "#64748b" });
            doc.drawText(amt, marginX + 440, y + 8, { font: "/F2", size: 8, color: "#087f5b" });
        });

        // Bottom Total
        y -= 30;
        doc.drawRect(marginX, y, width, 26, "#e6f4ea", "#10b981", 1);
        doc.drawText("TOTAL RECORDED TRAVEL EXPENDITURE:", marginX + 16, y + 8, { font: "/F2", size: 9, color: "#065f46" });
        doc.drawText(`BDT ${totalSpent.toLocaleString("en-BD")}`, marginX + 420, y + 8, { font: "/F2", size: 10, color: "#065f46" });

        // Footer
        doc.drawText("This official document summarizes verified domestic tourism reservations recorded in Travel Kori Bangladesh.", marginX, 60, { font: "/F1", size: 8, color: "#64748b" });
        doc.drawText(`Generated on ${new Date().toLocaleString("en-GB")}  •  Student Project Evaluation Report`, marginX, 45, { font: "/F2", size: 8, color: "#087f5b" });

        doc.download(`Travel-History-Summary-${userName.replace(/\s+/g, "_")}.pdf`);
    }

    // ----------------------------------------------------
    // 5. GENERATE HOTEL PARTNER PERFORMANCE REPORT PDF (Section N)
    // ----------------------------------------------------
    function generateHotelPartnerReportPDF(partner, bookings) {
        const p = partner || {};
        const pName = p.hotelName || p.fullName || "Radisson & Grand Sylhet Partner";
        const bList = Array.isArray(bookings) ? bookings : [];
        const totalRev = bList.reduce((sum, b) => sum + (Number(b.totalPrice || 0)), 0);

        const doc = createPdfDocument();
        const marginX = 40;
        const width = 515;

        doc.drawRect(marginX, 760, width, 60, "#123328", null, 0);
        doc.drawText("TRAVEL KORI BANGLADESH", marginX + 20, 795, { font: "/F2", size: 18, color: "#ffffff" });
        doc.drawText("Hotel Partner Operations & Reservations Performance Report", marginX + 20, 775, { font: "/F1", size: 10, color: "#bbf7d0" });

        doc.drawRect(marginX, 680, width, 65, "#f8fafc", "#cbd5e1", 1);
        doc.drawText("HOTEL PARTNER PROFILE", marginX + 16, 730, { font: "/F2", size: 9, color: "#64748b" });
        doc.drawText(`Property / Partner: ${pName}  •  District: ${p.district || "Bangladesh"}`, marginX + 16, 712, { font: "/F2", size: 11, color: "#0f172a" });
        doc.drawText(`Total Booked Rooms: ${bList.length}  •  Gross Revenue: BDT ${totalRev.toLocaleString("en-BD")}  •  Execution Status: Fully Operational`, marginX + 16, 694, { font: "/F1", size: 10, color: "#087f5b" });

        let y = 645;
        doc.drawRect(marginX, y, width, 24, "#0f172a", null, 0);
        doc.drawText("REF #", marginX + 10, y + 8, { font: "/F2", size: 9, color: "#ffffff" });
        doc.drawText("GUEST NAME", marginX + 120, y + 8, { font: "/F2", size: 9, color: "#ffffff" });
        doc.drawText("PROPERTY", marginX + 230, y + 8, { font: "/F2", size: 9, color: "#ffffff" });
        doc.drawText("DATES", marginX + 350, y + 8, { font: "/F2", size: 9, color: "#ffffff" });
        doc.drawText("REVENUE", marginX + 440, y + 8, { font: "/F2", size: 9, color: "#ffffff" });

        bList.slice(0, 15).forEach((b, i) => {
            y -= 26;
            const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
            doc.drawRect(marginX, y, width, 26, bg, "#e2e8f0", 0.5);

            const ref = (b.reference || "REF").slice(0, 14);
            const guest = (b.guestName || "Guest").slice(0, 16);
            const property = (b.hotelName || "Hotel").slice(0, 18);
            const dates = `${(b.checkIn || "").slice(5)} to ${(b.checkOut || "").slice(5)}`;
            const rev = `BDT ${Number(b.totalPrice || 0).toLocaleString("en-BD")}`;

            doc.drawText(ref, marginX + 10, y + 8, { font: "/F3", size: 8, color: "#334155" });
            doc.drawText(guest, marginX + 120, y + 8, { font: "/F2", size: 8, color: "#0f172a" });
            doc.drawText(property, marginX + 230, y + 8, { font: "/F1", size: 8, color: "#087f5b" });
            doc.drawText(dates, marginX + 350, y + 8, { font: "/F1", size: 8, color: "#64748b" });
            doc.drawText(rev, marginX + 440, y + 8, { font: "/F2", size: 8, color: "#087f5b" });
        });

        doc.download(`Hotel-Partner-Performance-Report-${new Date().toISOString().slice(0,10)}.pdf`);
    }

    // ----------------------------------------------------
    // 6. GENERATE TRANSPORT PARTNER OPERATIONS REPORT PDF (Section O)
    // ----------------------------------------------------
    function generateTransportPartnerReportPDF(partner, bookings) {
        const p = partner || {};
        const pName = p.operatorName || p.fullName || "Green Line & Express Transport Partner";
        const bList = Array.isArray(bookings) ? bookings : [];
        const totalRev = bList.reduce((sum, b) => sum + (Number(b.totalPrice || 0)), 0);

        const doc = createPdfDocument();
        const marginX = 40;
        const width = 515;

        doc.drawRect(marginX, 760, width, 60, "#c2410c", null, 0);
        doc.drawText("TRAVEL KORI BANGLADESH", marginX + 20, 795, { font: "/F2", size: 18, color: "#ffffff" });
        doc.drawText("Transport Operator Fleet Execution & Ticketing Statement", marginX + 20, 775, { font: "/F1", size: 10, color: "#ffedd5" });

        doc.drawRect(marginX, 680, width, 65, "#f8fafc", "#cbd5e1", 1);
        doc.drawText("TRANSPORT OPERATOR PROFILE", marginX + 16, 730, { font: "/F2", size: 9, color: "#64748b" });
        doc.drawText(`Operator: ${pName}  •  District: ${p.district || "Dhaka"}`, marginX + 16, 712, { font: "/F2", size: 11, color: "#0f172a" });
        doc.drawText(`Total Booked Tickets: ${bList.length}  •  Ticketing Revenue: BDT ${totalRev.toLocaleString("en-BD")}  •  Fleet Execution: Active`, marginX + 16, 694, { font: "/F1", size: 10, color: "#c2410c" });

        let y = 645;
        doc.drawRect(marginX, y, width, 24, "#0f172a", null, 0);
        doc.drawText("TICKET #", marginX + 10, y + 8, { font: "/F2", size: 9, color: "#ffffff" });
        doc.drawText("PASSENGER", marginX + 120, y + 8, { font: "/F2", size: 9, color: "#ffffff" });
        doc.drawText("ROUTE & FLEET", marginX + 230, y + 8, { font: "/F2", size: 9, color: "#ffffff" });
        doc.drawText("JOURNEY DATE", marginX + 350, y + 8, { font: "/F2", size: 9, color: "#ffffff" });
        doc.drawText("FARE", marginX + 440, y + 8, { font: "/F2", size: 9, color: "#ffffff" });

        bList.slice(0, 15).forEach((b, i) => {
            y -= 26;
            const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
            doc.drawRect(marginX, y, width, 26, bg, "#e2e8f0", 0.5);

            const ref = (b.reference || "TKT").slice(0, 14);
            const pax = (b.passengerName || "Passenger").slice(0, 16);
            const route = `${b.from || "Dhaka"} -> ${b.to || "Destination"}`.slice(0, 18);
            const dateStr = (b.journeyDate || "2026-10-28").slice(0, 10);
            const fare = `BDT ${Number(b.totalPrice || 0).toLocaleString("en-BD")}`;

            doc.drawText(ref, marginX + 10, y + 8, { font: "/F3", size: 8, color: "#334155" });
            doc.drawText(pax, marginX + 120, y + 8, { font: "/F2", size: 8, color: "#0f172a" });
            doc.drawText(route, marginX + 230, y + 8, { font: "/F1", size: 8, color: "#c2410c" });
            doc.drawText(dateStr, marginX + 350, y + 8, { font: "/F1", size: 8, color: "#64748b" });
            doc.drawText(fare, marginX + 440, y + 8, { font: "/F2", size: 8, color: "#c2410c" });
        });

        doc.download(`Transport-Operator-Operations-Report-${new Date().toISOString().slice(0,10)}.pdf`);
    }

    // Expose Global PDF Generator API
    window.TravelKoriPDF = {
        downloadTransportTicket: generateTransportTicketPDF,
        downloadHotelVoucher: generateHotelVoucherPDF,
        downloadGuideVoucher: generateGuideVoucherPDF,
        downloadTravelHistoryReport: generateTravelHistoryReportPDF,
        downloadHotelPartnerReport: generateHotelPartnerReportPDF,
        downloadTransportPartnerReport: generateTransportPartnerReportPDF
    };

    window.downloadTransportTicket = generateTransportTicketPDF;
    window.downloadHotelVoucher = generateHotelVoucherPDF;
    window.downloadGuideVoucher = generateGuideVoucherPDF;
    window.downloadTravelHistoryReport = generateTravelHistoryReportPDF;
    window.downloadHotelPartnerReport = generateHotelPartnerReportPDF;
    window.downloadTransportPartnerReport = generateTransportPartnerReportPDF;

})(window);
