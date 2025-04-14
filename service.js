const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 8080;

// Reutilizar una instancia de Puppeteer
let browser;

const initializeBrowser = async () => {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    console.log("Navegador inicializado.");
  }
};

// Ruta para procesar la URL
app.get('/render', async (req, res) => {
  const { url } = req.query; // Recibe la URL como parámetro de consulta (?url=)
  
  if (!url) {
    return res.status(400).send('Por favor, proporciona una URL como parámetro de consulta. Ejemplo: /render?url=http://tusitio.com');
  }

  try {
    // Asegúrate de que el navegador esté inicializado
    await initializeBrowser();

    console.log(`Cargando la página: ${url}`);
    const page = await browser.newPage();

    // Configura un timeout razonable y desactiva recursos innecesarios
    await page.setDefaultNavigationTimeout(30000); // 30 segundos
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      // Bloquea recursos innecesarios como imágenes, fuentes y estilos externos
      const blockedResources = ['image', 'stylesheet', 'font'];
      if (blockedResources.includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Navega a la URL proporcionada
    await page.goto(url, { waitUntil: 'domcontentloaded' }); // Carga solo el DOM, no espera recursos externos

    // Espera un tiempo mínimo para que el JavaScript se ejecute (ajusta según sea necesario)
    await page.waitForTimeout(3000); // Reduce el tiempo de espera a 3 segundos

    // Captura una captura de pantalla de la página
    const screenshot = await page.screenshot({ fullPage: true });

    // Cierra la pestaña (pero no el navegador)
    await page.close();

    // Devuelve la captura de pantalla como respuesta
    res.set('Content-Type', 'image/png');
    res.send(screenshot);
    
  } catch (error) {
    console.error('Error al procesar la página:', error);
    res.status(500).send('Ocurrió un error al procesar la página.');
  }
});

// Cierra el navegador al finalizar el proceso
process.on('exit', async () => {
  if (browser) {
    await browser.close();
    console.log("Navegador cerrado.");
  }
});

// Inicia el servidor
app.listen(port, async () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
  await initializeBrowser(); // Inicializa el navegador al iniciar el servidor
});

/*const express = require('express');
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
    await page.goto(url, { timeout: 0, waitUntil: 'networkidle2' }); // Espera a que la página cargue completamente

    // Espera un tiempo para que el JavaScript (como el model-viewer) se ejecute
    await new Promise(resolve => setTimeout(resolve, 10000)); // Ajusta el tiempo según lo que tarde en cargar el model-viewer

    // Opcional: Captura una captura de pantalla de la página
    const screenshot = await page.screenshot({ fullPage: true });

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
*/
