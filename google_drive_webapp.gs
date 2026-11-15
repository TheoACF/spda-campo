/**
 * SCRIPT DE UPLOAD AUTOMÁTICO PARA AS PASTAS DO GOOGLE DRIVE (EQUIPE A e EQUIPE B)
 *
 * Como ativar (leva 1 minuto):
 * 1. Acesse https://script.google.com/ e clique em "Novo Projeto".
 * 2. Apague o código que estiver lá e cole TODO este arquivo.
 * 3. Clique em "Implantar" (canto superior direito) > "Nova implantação".
 * 4. Em "Selecionar tipo", escolha "App da Web".
 * 5. Em "Executar como": escolha "Eu" (sua conta Google).
 * 6. Em "Quem pode acessar": escolha "Qualquer pessoa".
 * 7. Clique em "Implantar", autorize o acesso ao Drive e copie a "URL do App da Web".
 * 8. Cole essa URL no campo "URL do Servidor / Google Apps Script" dentro de ⚙ Ajustes no aplicativo SPDA Campo.
 */

const FOLDERS = {
  A: "1Yb-zWeo4lCsbByDpDlL0YMxbF3GlqHqA", // Pasta Equipe A (Dupla 1)
  B: "1HgzIPxKpqCl9-1c6H2LZIW46egbPU75r"  // Pasta Equipe B (Dupla 2)
};

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const team = (payload.equipe === "B" || payload.equipe === "2" || payload.equipe === 2) ? "B" : "A";
    const folderId = payload.folderId || FOLDERS[team] || FOLDERS.A;
    const folder = DriveApp.getFolderById(folderId);

    const results = [];

    // Salva um ou mais arquivos enviados em base64 (PDF, JSON e Fotos JPG)
    if (Array.isArray(payload.files)) {
      for (let i = 0; i < payload.files.length; i++) {
        const f = payload.files[i];
        const bytes = Utilities.base64Decode(f.base64);
        const blob = Utilities.newBlob(bytes, f.mimeType || "application/octet-stream", f.name);
        const created = folder.createFile(blob);
        results.push({ name: f.name, id: created.getId(), url: created.getUrl() });
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, team: team, folderId: folderId, uploaded: results.length, files: results }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
