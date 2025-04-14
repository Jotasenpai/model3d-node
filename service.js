const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 8080;

// Ruta para procesar la URL
app.get('/render', async (req, res) => {
  const { url } = req.query; // Recibe la URL como parámetro de consulta (?url=)
  
  if (!url) {
    return res.status(400).send('Por favor, proporciona una URL como parámetro de consulta. Ejemplo: /render?url=http://tusitio.com');
  }

  try {
    // Lanza Puppeteer
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });

    console.log(`Cargando la página: ${url}`);
    const page = await browser.newPage();
    //page.setDefaultNavigationTimeout(60000);

    // Navega a la URL proporcionada
    //await page.goto(url); // Espera a que la página cargue completamente
    const response = await page.goto(url, { timeout: 0, waitUntil: 'networkidle2' }); // Espera a que la página cargue completamente
    // Verificar la respuesta del servidor PHP
    if (response.status() === 200) {
      const responseText = await page.evaluate(() => document.body.innerText);
      if (responseText.trim() === 'OK') {
        console.log('El script PHP finalizó correctamente.');
      } else {
        console.error('El script PHP no devolvió "OK". Respuesta:', responseText);
      }
    } else {
      console.error('Error al ejecutar el script PHP. Código de estado:', response.status());
    }

    // Espera un tiempo para que el JavaScript (como el model-viewer) se ejecute
    //await new Promise(resolve => setTimeout(resolve, 10000)); // Ajusta el tiempo según lo que tarde en cargar el model-viewer

    // Opcional: Captura una captura de pantalla de la página
    //const screenshot = await page.screenshot({ fullPage: true });
    const screenshot = await page.screenshot({
      clip: { x: 0, y: 0, width: 800, height: 696 }
    });


    // Cierra el navegador
    await browser.close();

    // Devuelve la captura de pantalla como respuesta
    //res.status(200).send('Página cargada correctamente');
    res.set('Content-Type', 'image/png');
    res.send(screenshot);
    
  } catch (error) {
    console.error('Error al procesar la página:', error);
    res.status(500).send('Ocurrió un error al procesar la página.');
  }
});

// Inicia el servidor
app.listen(port, () => {
});
