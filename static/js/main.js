// Developer: Nelson Siu nsiu@grupocargo.com

//  JSON
let skuData = [];  

async function jsonLoad() {
   try {
       // JSON load
       const response = await fetch('https://raw.githubusercontent.com/cargoaidev/reception/main/sku/sku.json');
       //const fileId= '1daWrji-jE4_PjhSJfxfoufGwZLaNbPj8';
       //const response = await fetch('https://drive.google.com/uc?export=download&id=1daWrji-jE4_PjhSJfxfoufGwZLaNbPj8');
       skuData = await response.json(); // global
       console.log(skuData);

   } catch (error) {
       console.error('Error al cargar el JSON:', error);
   }
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
         table_output += '<thead class="table-head"><tr id="table-head"><th>CODIGO</th><th>DESCRIPCION</th><th>FECHA DE VENC.</th><th>ITEM</th><th>ALERGENO</th><th>ROTACION</th><th>ESTIBA SUGERIDA</th><th>FECHA ESTIBA</th><th>UBIC. ACTUAL</th></thead>';
         table_output += '<tbody>';

         var item = "";
         var intemNum = 1;

         for (var row = 2; row < sheet_data.length; row++) {
            table_output += '<tr>';

            const sel_cell = [10, 11, 14]; 

            for (var cell in sel_cell) {
               var cell_sheet = sel_cell[cell];
               

               if (cell_sheet == 10 && item == sheet_data[row][10]) {
                  intemNum++;
               } else if (cell_sheet == 10 && item != sheet_data[row][10]) {
                  intemNum = 1;
               }
               item = sheet_data[row][10];
               table_output += '<td>' + sheet_data[row][cell_sheet] + '</td>';
               console.log(typeof(item));
            }

            table_output += '<td>' + intemNum.toString().padStart(2, '0') + '</td>';

            
            const sku = skuData.find(skuItem => String(skuItem.sku).trim().toLowerCase() === String(item).trim().toLowerCase());

            
            if (sku) {
               console.log(sku.sku);
               console.log(sku.alergeno);
               console.log(sku);
               //console.log(item);
               var esAlergeno = sku.alergeno || "No especificado";  
               var skuRot = sku.rotacion || "No especificado"; 
               var posicion = sku.estiba || "No especificada";  
               table_output += '<td>' + esAlergeno + '</td>';
               table_output += '<td>' + skuRot + '</td>';
               table_output += '<td>' + posicion + '</td>';
            } else {
               table_output += '<td>Sin datos</td>';  
               table_output += '<td>Sin datos</td>';
               table_output += '<td>Sin datos</td>';
            }

            table_output += '<td>' + "  " + '</td>';
            table_output += '<td>' + "  " + '</td>';
            table_output += '</tr>';
            table_output += '</tbody>';
         }

         
         table_output += '<tfoot class="table-foot"><tr><td colspan="10">Operario (Apellido y Firma): ______________________________________________</td></tr><tr><td colspan="10">Coordinador (Apellido y Firma):  ______________________________________________</td></tr></tfoot>';
         table_output += '</table>';

         document.getElementById('excel_data').innerHTML = table_output;
      }

      excel_file.value = '';
   }
});

// on load function
window.onload = jsonLoad;
