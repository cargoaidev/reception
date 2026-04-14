// Developer: Siu engineer.siu@gmail.com
let skuData = [];
let currentTableData = [];

async function jsonLoad() {
    try {
        const response = await fetch('https://cdn.jsdelivr.net/gh/cargoaidev/reception@main/sku/sku.json');
        skuData = await response.json();
        console.log('SKU Data cargado:', skuData);
    } catch (error) {
        console.error('Error al cargar el JSON:', error);
    }
}

function calcularLote(fechaVencimiento, vidaUtil) {
    try {
        if (!vidaUtil || vidaUtil === "SIN" || vidaUtil === "0" || isNaN(parseInt(vidaUtil))) {
            return "";
        }

        const vidaUtilDias = parseInt(vidaUtil);

        let fechaVenc;
        if (fechaVencimiento.includes('/')) {
            const [day, month, year] = fechaVencimiento.split('/');
            fechaVenc = new Date(year, month - 1, day);
        } else {
            fechaVenc = new Date(fechaVencimiento);
        }

        if (isNaN(fechaVenc.getTime())) {
            return "";
        }

        const fechaFabricacion = new Date(fechaVenc);
        fechaFabricacion.setDate(fechaFabricacion.getDate() - vidaUtilDias);

        const añoFabricacion = fechaFabricacion.getFullYear();
        const fechaReferencia = new Date(añoFabricacion, 0, 1);

        const diferenciaMs = fechaFabricacion - fechaReferencia;
        const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

        const lote = (diferenciaDias + 1).toString().padStart(3, '0');

        if (lote === "000" || diferenciaDias < 0 || diferenciaDias > 365) {
            return "";
        }

        return lote;

    } catch (error) {
        console.error('Error calculando lote:', error);
        return "";
    }
}

function printLabel(index) {
    if (currentTableData.length === 0) {
        alert('No hay datos cargados');
        return;
    }
    const labelData = currentTableData[index];
    createAndPrintLabel(labelData);
}

function printAllLabels() {
    if (currentTableData.length === 0) {
        alert('No hay datos cargados');
        return;
    }
    const count = currentTableData.length;
    if (confirm(`¿Imprimir ${count} etiquetas? Se abrirá UNA ventana de impresión.`)) {
        createAndPrintAllLabels(currentTableData);
    }
}

function generateQRData(labelData) {
    const qrData = {
        sku: labelData.sku,
        descripcion: labelData.descripcion.substring(0, 50),
        lpn: labelData.lpn,
        vencimiento: labelData.vencimiento,
        lote: labelData.lote,
        rotacion: labelData.rotacion,
        apilabilidad: labelData.apilabilidad,
        estiba: labelData.estiba,
        remito: labelData.remito,
        fechaRecepcion: labelData.fechaRecepcion,
        horaRecepcion: labelData.horaRecepcion,
        tipo: "ETIQUETA_RECEPCION"
    };
    return encodeURIComponent(JSON.stringify(qrData));
}

function createAndPrintLabel(labelData) {
    const printWindow = window.open('', '_blank', 'width=500,height=400');
    const qrData = generateQRData(labelData);
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

    const labelHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Etiqueta ${labelData.lpn}</title>
        <style>
            @media print {
                @page {
                    margin: 0;
                    size: 140mm 90mm;
                }
                body {
                    margin: 0;
                    padding: 2mm 2mm 2mm 4mm;
                    width: 136mm;
                    height: 86mm;
                    font-family: 'Arial Black', Gadget, sans-serif;
                    background: #ffffff;
                    display: grid;
                    grid-template-columns: 80mm 50mm;
                    grid-template-rows: 25mm 18mm 18mm 14mm 8mm;
                    gap: 1mm;
                    box-sizing: border-box;
                }
            }
            body {
                margin: 0;
                padding: 2mm 2mm 2mm 4mm;
                width: 136mm;
                height: 86mm;
                font-family: 'Arial Black', Gadget, sans-serif;
                background: #ffffff;
                display: grid;
                grid-template-columns: 80mm 50mm;
                grid-template-rows: 25mm 18mm 18mm 14mm 8mm;
                gap: 1mm;
                box-sizing: border-box;
            }
            .sku-section {
                grid-column: 1;
                grid-row: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            .lpn-section {
                grid-column: 1;
                grid-row: 2;
                display: flex;
                align-items: center;
            }
            .vencimiento-section {
                grid-column: 1;
                grid-row: 3;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .instrucciones-section {
                grid-column: 1;
                grid-row: 4;
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
            }
            .remito-section {
                grid-column: 1;
                grid-row: 5;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .qr-section {
                grid-column: 2;
                grid-row: 1 / span 5;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding-left: 2mm;
            }
            .sku-code {
                font-size: 32px;
                font-weight: 900;
                letter-spacing: 1px;
                margin-bottom: 1mm;
            }
            .descripcion-text {
                font-size: 14px;
                font-weight: bold;
                line-height: 1.1;
            }
            .lpn-code {
                font-size: 22px;
                font-weight: 900;
                letter-spacing: 1px;
            }
            .vencimiento-text {
                font-size: 26px;
                font-weight: 900;
            }
            .lote-text {
                font-size: 26px;
                font-weight: 900;
            }
            .instruccion-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            .instruccion-titulo {
                font-size: 12px;
                font-weight: 900;
            }
            .instruccion-valor {
                font-size: 22px;
                font-weight: 900;
                margin-top: 0.5mm;
            }
            .qr-code {
                width: 45mm;
                height: 45mm;
            }
            .remito-text {
                font-size: 22px;
                font-weight: 900;
            }
            .fecha-text {
                font-size: 22px;
                font-weight: 900;
            }
        </style>
    </head>
    <body>
        <div class="sku-section">
            <div class="sku-code">SKU: ${labelData.sku}</div>
            <div class="descripcion-text">${labelData.descripcion}</div>
        </div>
        <div class="lpn-section">
            <div class="lpn-code">LPN: ${labelData.lpn}</div>
        </div>
        <div class="vencimiento-section">
            <div class="vencimiento-text">VENCE: ${labelData.vencimiento}</div>
            <div class="lote-text">LOTE: ${labelData.lote}</div>
        </div>
        <div class="instrucciones-section">
            <div class="instruccion-item">
                <div class="instruccion-titulo">ROTACIÓN</div>
                <div class="instruccion-valor">${labelData.rotacion}</div>
            </div>
            <div class="instruccion-item">
                <div class="instruccion-titulo">APILABILIDAD</div>
                <div class="instruccion-valor">${labelData.apilabilidad}</div>
            </div>
            <div class="instruccion-item">
                <div class="instruccion-titulo">ESTIBA SUGERIDA</div>
                <div class="instruccion-valor">${labelData.estiba}</div>
            </div>
        </div>
        <div class="remito-section">
            <div class="remito-text">REMITO: ${labelData.remito}</div>
            <div class="fecha-text">REC: ${labelData.fechaRecepcion}</div>
        </div>
        <div class="qr-section">
            <img class="qr-code" src="${qrURL}" alt="Código QR" />
        </div>
        <script>
            window.onload = function() {
                window.print();
                setTimeout(function() {
                    window.close();
                }, 500);
            };
        </script>
    </body>
    </html>
    `;

    printWindow.document.write(labelHTML);
    printWindow.document.close();
}

function createAndPrintAllLabels(allLabelsData) {
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    let allLabelsHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Todas las Etiquetas - ${allLabelsData.length} unidades</title>
        <style>
            @media print {
                @page {
                    margin: 0;
                    size: 140mm 90mm;
                }
                body {
                    margin: 0;
                    padding: 0;
                }
                .label-container {
                    page-break-after: always;
                    margin: 0;
                    padding: 2mm 2mm 2mm 4mm;
                    width: 136mm;
                    height: 86mm;
                    font-family: 'Arial Black', Gadget, sans-serif;
                    background: #ffffff;
                    display: grid;
                    grid-template-columns: 80mm 50mm;
                    grid-template-rows: 25mm 18mm 18mm 14mm 8mm;
                    gap: 1mm;
                    box-sizing: border-box;
                }
            }
            .label-container {
                margin: 10px;
                padding: 2mm 2mm 2mm 4mm;
                width: 136mm;
                height: 86mm;
                font-family: 'Arial Black', Gadget, sans-serif;
                background: #ffffff;
                display: grid;
                grid-template-columns: 80mm 50mm;
                grid-template-rows: 25mm 18mm 18mm 14mm 8mm;
                gap: 1mm;
                box-sizing: border-box;
            }
            .sku-section {
                grid-column: 1;
                grid-row: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            .lpn-section {
                grid-column: 1;
                grid-row: 2;
                display: flex;
                align-items: center;
            }
            .vencimiento-section {
                grid-column: 1;
                grid-row: 3;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .instrucciones-section {
                grid-column: 1;
                grid-row: 4;
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
            }
            .remito-section {
                grid-column: 1;
                grid-row: 5;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .qr-section {
                grid-column: 2;
                grid-row: 1 / span 5;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding-left: 2mm;
            }
            .sku-code {
                font-size: 32px;
                font-weight: 900;
                letter-spacing: 1px;
                margin-bottom: 1mm;
            }
            .descripcion-text {
                font-size: 14px;
                font-weight: bold;
                line-height: 1.1;
            }
            .lpn-code {
                font-size: 22px;
                font-weight: 900;
                letter-spacing: 1px;
            }
            .vencimiento-text {
                font-size: 26px;
                font-weight: 900;
            }
            .lote-text {
                font-size: 26px;
                font-weight: 900;
            }
            .instruccion-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            .instruccion-titulo {
                font-size: 12px;
                font-weight: 900;
            }
            .instruccion-valor {
                font-size: 22px;
                font-weight: 900;
                margin-top: 0.5mm;
            }
            .qr-code {
                width: 45mm;
                height: 45mm;
            }
            .remito-text {
                font-size: 22px;
                font-weight: 900;
            }
            .fecha-text {
                font-size: 22px;
                font-weight: 900;
            }
            .page-counter {
                position: absolute;
                bottom: 2mm;
                right: 2mm;
                font-size: 10px;
                font-weight: bold;
                color: #000;
            }
        </style>
    </head>
    <body>
    `;

    allLabelsData.forEach((labelData, index) => {
        const qrData = generateQRData(labelData);
        const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
        allLabelsHTML += `
        <div class="label-container">
            <div class="sku-section">
                <div class="sku-code">SKU: ${labelData.sku}</div>
                <div class="descripcion-text">${labelData.descripcion}</div>
            </div>
            <div class="lpn-section">
                <div class="lpn-code">LPN: ${labelData.lpn}</div>
            </div>
            <div class="vencimiento-section">
                <div class="vencimiento-text">VENCE: ${labelData.vencimiento}</div>
                <div class="lote-text">LOTE: ${labelData.lote}</div>
            </div>
            <div class="instrucciones-section">
                <div class="instruccion-item">
                    <div class="instruccion-titulo">ROTACIÓN</div>
                    <div class="instruccion-valor">${labelData.rotacion}</div>
                </div>
                <div class="instruccion-item">
                    <div class="instruccion-titulo">APILABILIDAD</div>
                    <div class="instruccion-valor">${labelData.apilabilidad}</div>
                </div>
                <div class="instruccion-item">
                    <div class="instruccion-titulo">ESTIBA SUGERIDA</div>
                    <div class="instruccion-valor">${labelData.estiba}</div>
                </div>
            </div>
            <div class="remito-section">
                <div class="remito-text">REMITO: ${labelData.remito}</div>
                <div class="fecha-text">REC: ${labelData.fechaRecepcion}</div>
            </div>
            <div class="qr-section">
                <img class="qr-code" src="${qrURL}" alt="Código QR" />
            </div>
            <div class="page-counter">${index + 1} / ${allLabelsData.length}</div>
        </div>
        `;
    });

    allLabelsHTML += `
        <script>
            window.onload = function() {
                window.print();
                setTimeout(function() {
                    window.close();
                }, 1000);
            };
        </script>
    </body>
    </html>
    `;

    printWindow.document.write(allLabelsHTML);
    printWindow.document.close();
}

const excel_file = document.getElementById('excel_file');

excel_file.addEventListener('change', (event) => {
    if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(event.target.files[0].type)) {
        document.getElementById('excel_data').innerHTML = '<div class="alert alert-danger">Only .xlsx or .xls file format are allowed</div>';
        excel_file.value = '';
        return false;
    }

    var reader = new FileReader();
    reader.readAsArrayBuffer(event.target.files[0]);

    reader.onload = function (event) {
        var data = new Uint8Array(reader.result);
        var work_book = XLSX.read(data, { type: 'array' });
        var sheet_name = work_book.SheetNames;
        var sheet_data = XLSX.utils.sheet_to_json(work_book.Sheets[sheet_name[0]], { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });

        if (sheet_data.length > 0) {
            var remito = document.getElementById('remito');
            var hora = document.getElementById('hora');
            var hora_actual = new Date();
            remito.innerHTML = "REMITO:  " + sheet_data[2][3];
            hora.innerHTML = "FECHA:  " + hora_actual.getDate() + "/" + (hora_actual.getMonth() + 1) + "/" + hora_actual.getFullYear() + " ,       HORA: " + String(hora_actual.getHours()).padStart(2, '0') + ":" + String(hora_actual.getMinutes()).padStart(2, '0') + ":" + String(hora_actual.getSeconds()).padStart(2, '0');

            var table_output = '<table class="section-table">';
            table_output += '<thead class="table-head"><tr id="table-head">' +
                '<th>CODIGO</th>' +
                '<th>DESCRIPCION</th>' +
                '<th>LPN</th>' +
                '<th>FECHA DE VENC.</th>' +
                '<th>LOTE JULIANO</th>' +
                '<th>LOTE PRODUCCIÓN</th>' +
                '<th>ITEM</th>' +
                '<th>ALERGENO</th>' +
                '<th>ROTACION</th>' +
                '<th>APILABILIDAD</th>' +
                '<th>ESTIBA SUGERIDA</th>' +
                '<th>FECHA ESTIBA</th>' +
                '<th>UBIC. ACTUAL</th>' +
                '</tr></thead>';
            table_output += '<tbody>';

            var item = "";
            var intemNum = 1;
            currentTableData = [];

            for (var row = 2; row < sheet_data.length; row++) {
                table_output += '<tr>';

                const codigo = sheet_data[row][10] || '';
                const descripcion = sheet_data[row][11] || '';
                const lpn = sheet_data[row][4] || '';
                const vencimiento = sheet_data[row][14] || '';
                const loteProduccion = sheet_data[row][15] || '';

                let loteJuliano = "";
                const sku = skuData.find(skuItem => String(skuItem.sku).trim().toLowerCase() === String(codigo).trim().toLowerCase());
                if (sku && sku.vida_util && sku.vida_util !== "SIN") {
                    loteJuliano = calcularLote(vencimiento, sku.vida_util);
                }

                if (item == codigo) {
                    intemNum++;
                } else {
                    intemNum = 1;
                }
                item = codigo;

                table_output += '<td>' + codigo + '</td>';
                table_output += '<td>' + descripcion + '</td>';
                table_output += '<td>' + lpn + '</td>';
                table_output += '<td>' + vencimiento + '</td>';
                table_output += '<td>' + loteJuliano + '</td>';
                table_output += '<td>' + loteProduccion + '</td>';
                table_output += '<td>' + intemNum.toString().padStart(2, '0') + '</td>';

                if (sku) {
                    table_output += '<td>' + (sku.alergeno || "No especificado") + '</td>';
                    table_output += '<td>' + (sku.rotacion || "No especificado") + '</td>';
                    table_output += '<td>' + (sku.apilabilidad || "No especificado") + '</td>';
                    table_output += '<td>' + (sku.estiba || "No especificada") + '</td>';
                } else {
                    table_output += '<td>Sin datos</td><td>Sin datos</td><td>Sin datos</td><td>Sin datos</td>';
                }

                table_output += '<td>   ' + '</td>';
                table_output += '<td>   ' + '</td>';
                table_output += '</tr>';

                const labelData = {
                    sku: codigo,
                    descripcion: descripcion,
                    lpn: lpn,
                    vencimiento: vencimiento,
                    lote: loteJuliano,
                    rotacion: sku ? (sku.rotacion || 'N/A') : 'N/A',
                    apilabilidad: sku ? (sku.apilabilidad || 'N/A') : 'N/A',
                    estiba: sku ? (sku.estiba || 'N/A') : 'N/A',
                    remito: sheet_data[2][3] || '',
                    fechaRecepcion: hora_actual.getDate() + "/" + (hora_actual.getMonth() + 1) + "/" + hora_actual.getFullYear(),
                    horaRecepcion: String(hora_actual.getHours()).padStart(2, '0') + ":" + String(hora_actual.getMinutes()).padStart(2, '0')
                };
                currentTableData.push(labelData);
            }

            table_output += '</tbody>';
            table_output += '</table>';
            document.getElementById('excel_data').innerHTML = table_output;
        }
        excel_file.value = '';
    };
});

window.onload = jsonLoad;