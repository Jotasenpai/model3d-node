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
      
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    // Navega a la URL proporcionada
    console.log(`Cargando la página: ${url}`);
    await page.goto(url, { timeout: 0, waitUntil: 'networkidle2' }); // Espera a que la página cargue completamente
    
    console.log(`Goto pagina`);

    // Espera un tiempo para que el JavaScript (como el model-viewer) se ejecute
    await new Promise(resolve => setTimeout(resolve, 10000)); // Ajusta el tiempo según lo que tarde en cargar el model-viewer
    
    console.log(`Modelo cargado`);

    // Opcional: Captura una captura de pantalla de la página
    const screenshot = await page.screenshot({ fullPage: true });
    console.log(`Imagen capturada`);

    // Cierra el navegador
    await browser.close();
    console.log(`He cerrado el navegador`);

    // Devuelve la captura de pantalla como respuesta
    res.set('Content-Type', 'image/jpeg');
    res.send(screenshot);
    
    console.log(`Imagen generada`+screenshot);
  } catch (error) {
    console.error('Error al procesar la página:', error);
    res.status(500).send('Ocurrió un error al procesar la página.');
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servicio corriendo en http://localhost:${port}`);
});
