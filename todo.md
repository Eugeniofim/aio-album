# AÍO — Site App do Disco — TODO

## Funcionalidades Principais
- [x] Paleta de cores azul-claro aquático (oklch)
- [x] Tipografia: Crimson Text + Poppins
- [x] Capa do disco inline SVG (AÍO azul-claro)
- [x] Hero section com capa clicável (abre Songbook)
- [x] Player principal com controles (play/pause, anterior/próximo, volume, seek)
- [x] Tracklist com 7 faixas clicáveis
- [x] Songbook Interativo (modal com abas por faixa: letra + cifra)
- [x] Seção de Áudio de Alta Fidelidade (Binaural, Estéreo 2.0, Dolby Atmos)
- [x] 7 Videoclipes (galeria com modal YouTube embed)
- [x] Seção de Músicos
- [x] Quote section com frase do álbum
- [x] Footer com links e redes sociais
- [x] Página de Imprensa (/press)
- [x] Navegação responsiva com links âncora

## Backend / Banco de Dados
- [x] Schema do banco: tracks, musicians, videoclipes, albumSettings, songbookAssets
- [x] Migração do banco (pnpm db:push)
- [x] Helpers de DB: getAllTracks, getPublishedTracks, upsertTrack, deleteTrack, reorderTracks
- [x] Helpers de DB: getAllMusicians, upsertMusician, deleteMusician
- [x] Helpers de DB: getAllVideoclipes, upsertVideoclipe, deleteVideoclipe
- [x] Helpers de DB: getSetting, setSetting, getAllSongbookAssets, upsertSongbookAsset
- [x] tRPC routers: album (public), tracks (admin), musicians (admin), videoclipes (admin), settings (admin), songbook (admin)
- [x] Upload de áudio via S3 (storagePut)
- [x] Upload de capa de faixa via S3
- [x] Upload de foto de músico via S3
- [x] Upload de assets do songbook (PDF, ZIP) via S3
- [x] Extração automática de YouTube ID e thumbnail

## Área Administrativa
- [x] Página /admin com autenticação (role=admin)
- [x] Admin reescrito com senha simples '1234' (sessionStorage) — sem OAuth obrigatório
- [x] Gerenciamento de faixas (criar, editar, deletar, reordenar)
- [x] Upload de áudio WAV/MP3 por faixa
- [x] Upload de capa por faixa
- [x] Gerenciamento de músicos (criar, editar, deletar)
- [x] Upload de foto de músico
- [x] Gerenciamento de videoclipes (criar, editar, deletar, link YouTube)
- [x] Upload de assets do songbook (PDF completo, ZIP álbum)
- [x] Configurações do álbum (quote, descrição, subtítulo)

## Rota e Navegação
- [x] Rota /admin registrada no App.tsx

## Testes
- [x] Testes de auth.logout (existente)
- [x] Testes de album.routers (tracks, músicos, videoclipes, settings — 14 testes)
- [x] TypeScript sem erros (pnpm check)

## Pendente / Próximos Passos
- [ ] Adicionar dados reais: nomes das 7 faixas, letras, cifras, briefings
- [ ] Upload das fotos dos músicos reais
- [ ] Links reais para Spotify, Apple Music, YouTube Music, Deezer
- [ ] Links reais para Instagram, Facebook, YouTube
- [ ] Upload dos áudios WAV das 7 faixas
- [ ] Links dos 7 videoclipes no YouTube
- [ ] Songbook PDF completo para download
- [ ] Imagem real da capa do disco (substituir SVG placeholder)
- [ ] Logos dos patrocinadores no footer (FCC, Prefeitura de Curitiba, Ministério da Cultura)
- [ ] Página de imprensa atualizada com dados reais do banco
- [ ] Mobile menu (hamburger) para navegação em telas pequenas

## Admin v2 — Editor Completo por Faixa
- [x] Editor dedicado por faixa (tela separada ao clicar na faixa)
- [x] Seção Áudio do Player com substituir/excluir
- [x] Seção Videoclipe: YouTube URL + upload MP4/MOV/WebM
- [x] Seção Capa da Faixa com "Recriar Capa com IA" (generateImage)
- [x] Seção Briefing da Música
- [x] Seção Cifra / Acordes (monospace)
- [x] Seção Letra Completa
- [x] Seção Letra Sincronizada (Karaokê) com timestamps [m:ss]
- [x] Schema atualizado: syncedLyrics, youtubeUrl, youtubeId, videoKey, videoUrl
- [x] Migração db:push aplicada
- [x] upsertTrack corrigido para update parcial (sem sobrescrita de title/composer)
- [x] Novo router: tracks.generateCover (IA)
- [x] Novo router: tracks.uploadVideo (S3)
- [x] Novo router: tracks.setYoutube

## Correções de Bugs (Jun 2026)
- [x] Corrigir: faixas adicionadas no Admin não apareciam no player/songbook público (isPublished=false por padrão)
- [x] Publicar faixas existentes no banco via SQL UPDATE
- [x] Admin: novas faixas criadas com isPublished=true por padrão
- [x] Admin: toggle "Publicada/Rascunho" mais visível (badge colorido verde/cinza)
- [x] Player: exibir briefing da faixa abaixo do título/compositor
- [x] Songbook: botão "Ouvir" agora muda a faixa no InlinePlayer (externalIdx prop)
- [x] Songbook: scroll suave ao player ao clicar "Ouvir"

## Correções Críticas (Jun 2026 - sessão 2)
- [x] Criar localAdminProcedure com autenticação por token de senha local (sem OAuth)
- [x] Atualizar main.tsx para enviar X-Admin-Token automaticamente quando admin logado
- [x] Aceitar arquivos .wav no upload de áudio (além de .mp3) — já estava correto
- [x] Verificar e corrigir fluxo de upload de áudio no servidor — funcionando
- [x] Testar player após re-upload de áudio — TOCANDO (readyState=4, sem erros)

## Correção Crítica de Bug S3 (Jun 2026 - sessão 3)
- [x] BUG RAIZ ENCONTRADO: arquivos com espaços no nome causam 403 no CloudFront após upload
- [x] Corrigir sanitizeFileName() no servidor: remove espaços, acentos e caracteres especiais
- [x] Aplicar sanitização em uploadAudio, uploadCover e uploadVideo
- [x] Testar upload com nome sanitizado: HTTP 200 e arquivo acessível imediatamente
- [x] Testar player no browser: botão Pausar visível, contador avançando, áudio tocando
