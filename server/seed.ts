import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { tracks } from "../drizzle/schema";

// One-off seed script: populates the new Postgres (Neon) database with the
// real AíO album content, migrated out of Manus. Run once after the schema
// has been pushed (`pnpm db:push`) and before/after first deploy:
//   DATABASE_URL=... pnpm tsx server/seed.ts

const trackData = [
  {
    trackNumber: 1,
    title: "UM OUTRO MUNDO",
    composer: "Eugênio Fim",
    duration: "3:10",
    lyrics:
      "F#sus​\n\nUm outro mundo no mesmo mundo​\n\nQuantos mundos sobre nós​\n\nO lado escuro do mesmo mundo​\n\nPano de fundo sobre nós​\n\n​\n\nEm9​\n\nLa onde o mar bebe o sol​\n\nE o rosado do céu borela clarear​\n\nA9​\n\nLa do outro lado de la ​\n\nSe as estrelas do céu descolar​\n\nEm9​\n\nEu vou saber porque vai​\n\nVai chover no quintal as estrelas​\n\nA9​\n\nE o poeta vai rir todo céu a cair​\n\n                             F#sus​\n\nE o futuro vai começar",
    chords: "",
    briefing: "<p></p>",
    syncedLyrics: "",
    youtubeUrl: "https://youtu.be/6efdgcAPAMc",
    youtubeId: "6efdgcAPAMc",
    audioKey: "tracks/audio/01-um-outro-mundo.mp3",
    audioUrl: "/manus-storage/tracks/audio/01-um-outro-mundo.mp3",
    isPublished: true,
    sortOrder: 0,
  },
  {
    trackNumber: 2,
    title: "POXA",
    composer: "Eugênio Fim, Tio Tonho Champoski e Mateus Lacerda",
    duration: "3:07",
    lyrics:
      "​\n\n\t Em              A9         C7M                       F#/D     F7M   G   F#   Em​\n\nMas, pôxa... que pena, você de uma hora pra outra resolveu partir assim...​\n\nB                                 Bb​\n\nSei que nao adianta fingir​\n\n            Em                       B                           Bb​\n\nJa faz tempo que queremos nos libertar​\n\nA9                                                               G6​\n\nQuase voce esqueceu seu chinelo azul​\n\nEm7                                                    C#m7(b5)    C7M    C7M/B    C7M/Bb      ​\n\nEu coloquei pra voce na bolsa amarela​\n\nA9                      G       Em7​\n\nAquela que te dei no natal​\n\nA9                          G6        F#/D   F7M           Em                                   A9​\n\n as revistas da colecao estao na sacola do big, me ligue quando chegar la...​\n\n​\n\nEm                                                        C#m7(b5) C7M​\n\nA cidade anda tao violenta utimamente​\n\n         C7M/B C7M/Bb       A9              G   F#/D  Em​\n\nE vc sozinha a uma hora dessas nao da pra confiar​\n\n​\n\n           F9     G9                             Em                       C#m7(b5) ​\n\nPosa ai, dorme na minha cama, usa meu pijama​\n\nC7M C7M/B       Em7                                                                   2x​\n\nVou dormir no sofa...​\n\n​\n\nEm7                                                                A9​\n\nEu já tinha colocado um vinho branco so pra esfriar​\n\n​",
    chords: "",
    briefing:
      "* Violão aço Lobo \n* Bass régios médias agudas no começo entra mesmo no Si maior \n* vaso condução talvez tb / algum\nGroove leve vina \n",
    syncedLyrics: "",
    youtubeUrl: "https://youtu.be/8rT8Th2ykTU",
    youtubeId: "8rT8Th2ykTU",
    audioKey: "tracks/audio/02-poxa.mp3",
    audioUrl: "/manus-storage/tracks/audio/02-poxa.mp3",
    isPublished: true,
    sortOrder: 1,
  },
  {
    trackNumber: 3,
    title: "SOBRE HOJE",
    composer: "Eugênio Fim & Tio Tonho  Champoski",
    duration: "4:04",
    lyrics:
      "E6.9                                             A7+​\n\nBebemos de um poço raso onde só se aprofunda ​\n\nE6.9                                             ​\n\nA dor ​\n\n                                         A7+​\n\nnossas verdades tão escassas e o abundante ​\n\nE6.9                                             A7+​\n\nMedo,  ai o medo .....o medo não ​\n\n      E6.9                                             A7+​\n\nai o medo o medo não Oooohhh ​\n\n​E6.9                                             A7+​\n\nEu fico tão triste  vendo você tão triste assim ​\n\n                                 E6.9                                             A7+​\n\nvendo a minha essência Pra vc distorcer ​\n\n            E6.9                                             A7+​\n\nnum acorde só, sozinho​\n\n                 E6.9                                             A7+​\n\nnum acorde só  sozinho​\n\nE6.9                                             A7+​\n\nOooohhh​\n\nB4                               A9​\n\nAté fiz um poeminha ​pra eu te falar​\n\n​                  B4                               A9​\nno ouvido bem baixinho​​\n\n                                B4                               A9​\n\nPra quando eu te abraçar ​meu amor ​\n\nE6.9                                             A7+                        ​\n\nFlagrei você chorando escondidinho​\n\n                  E6.9                                             A7+​\n\nAté que te entendo Felicidade em gotas ​\n\n                          E6.9                                             A7+​\n\na maldade é grandona a dor é grandona viu ​\n\nE6.9                                             A7+​  O nosso abraço platônico na solidão da rede​\n\n                              E6.9                                             A7+​\n\nweb afetividade contagioso carinho ​\n\nE6.9                                             A7+​\n\nCarinho não !        3x       Ohhhhhhhhh. ohhhhh   ",
    chords: "",
    briefing: "",
    syncedLyrics: "",
    youtubeUrl: "https://youtu.be/qRwXQhOxFPU",
    youtubeId: "qRwXQhOxFPU",
    audioKey: "tracks/audio/03-sobre-hoje.mp3",
    audioUrl: "/manus-storage/tracks/audio/03-sobre-hoje.mp3",
    isPublished: true,
    sortOrder: 2,
  },
  {
    trackNumber: 4,
    title: "À DERIVA",
    composer: "Eugênio Fim",
    duration: "2:33",
    lyrics:
      "(C7+  B7/F#    C7+    B7/F#  Am7   B7   C7+ B7)​\n\nDe proa em proa​\n\nBarco a deriva em alto mar​\n\nÉ terra a vista​\n\nAncorar no chão ​\n\nDo oceano q entrou e mergulhou nas águas fundas da ilusão, da ilusão​\n\n​\n\nE Ali morava ​\n\nE Flutuava assim em vão​\n\nDe vez em quando​\n\nSubia para respirar​\n\nE olhava a ilha bem de longe, e de tão longe não se via lá, Vivia lá...​\n\n​\n\nTem tempestade ​\n\nMolhou a bolsa e o baton​\n\nPassou do ponto​\n\nOnibus lotado ​\n\nde coração amontoado, bagunçado, congelado e sem noção, sem noção​\n\n​\n\nDo amor q passa​\n\nE nao volta mais, se nao​\n\nFechar os olhos ​\n\ne lembrar dos laços e afetos que um dia foram teus.... que um dia foram teus​\n\n​\n\nC7+                                               B7/F#​\n\nÉ porta dos fundos(sonhos) q vai te levar daqui​\n\nC7+                                               B7/F#​\n\nDe novo pra nova realidade que virá​\n\nC7+                                               B7/F#​\n\nÉ porta dos fundos q vai te levar daqui​\n\nC7+                                               B7/F#​\n\nAcalme- se amigo não se desespere assim​\n\nAm7                                  Em​\n\nPois se tem que ser, que VENTE  2x",
    chords: "",
    briefing: "* Groove cajon\n* shake\n* aço \n* Bass\n",
    syncedLyrics: "",
    youtubeUrl: "https://youtu.be/eiJgD_3aTNc",
    youtubeId: "eiJgD_3aTNc",
    audioKey: "tracks/audio/04-a-deriva.mp3",
    audioUrl: "/manus-storage/tracks/audio/04-a-deriva.mp3",
    isPublished: true,
    sortOrder: 3,
  },
  {
    trackNumber: 5,
    title: "DESPOJADA",
    composer: "Eugênio Fim",
    duration: "2:54",
    lyrics:
      "(C9 C/F)​\nChega, Chega linda​\nDespojada, que alegria​\nVem sorrindo, representa​\nQ encanta o impossível​\n\nEntão fascina teu ouvido​\nLogo em frente da tua vida​\ntão tranquila natureza​\nEspontânea feminina​\n\n​\n\n​\n\n(C9 G/B C/F C/E )​\nSerpente encantada​\nPlatônico que fique pela (2x)​\nestrada encantada​\nPlatônico que fique (pela estrada)​\n\n​(C9 C/F)​\n\nPela estrada dessa vida​​\nQue se cruza na esquina​​\ntão tranquila natureza​​\nvem de dentro endorfina​​\n\nq esquenta e passeia​​\npela mente, mentirinha ​\ncorre a vida, ampulheta ​\n\nEspontânea Severina​\n\n​\n\nREFRÃO​",
    chords: "",
    briefing: "Experimentar Lobo no violão aço \nVina - vaso/ condução \nLéo Bass \nEu viola \n",
    syncedLyrics: "",
    youtubeUrl: "https://youtu.be/V56WoEjoeTE",
    youtubeId: "V56WoEjoeTE",
    audioKey: "tracks/audio/05-despojada.mp3",
    audioUrl: "/manus-storage/tracks/audio/05-despojada.mp3",
    isPublished: true,
    sortOrder: 4,
  },
  {
    trackNumber: 6,
    title: "CUITELINHO",
    composer: "Public Domain",
    duration: "2:58",
    lyrics:
      "<p>Cheguei na beira do porto </p><p>Onde as ondas se espáia </p><p>As garças dá meia volta </p><p>E senta na beira da praia </p><p>E o cuitelinho não gosta </p><p>Que o botão de rosa caia, aí aí </p><p>Aí quando eu vim da minha terra Despedi da parentaia </p><p>Eu entrei no Mato Grosso Dei em terras paraguaias </p><p>Lá tinha revolução Enfrentei forte bataia, aí aí </p><p>A tua saudade corta Como aço de navaia </p><p>O coração fica aflito Bate uma, a outra faia </p><p>Os zóio se enche d'água </p><p>Que até a vista se atrapaia, aí aí</p>",
    chords: "",
    briefing: "",
    syncedLyrics:
      "[0:08] Cheguei na beira do porto \n[0:11] onde as ondas se espaia\n[0:19] as garça da meia volta\n[0:24] Senta na beira da praia\n[0:30] e o cuitelinho não gosta\n[0:36] que o botão de rosa caia ia...",
    youtubeUrl: "https://youtu.be/L-8rIXanESQ",
    youtubeId: "L-8rIXanESQ",
    audioKey: "tracks/audio/06-cuitelinho.mp3",
    audioUrl: "/manus-storage/tracks/audio/06-cuitelinho.mp3",
    isPublished: true,
    sortOrder: 5,
  },
  {
    trackNumber: 7,
    title: "JÁ É HORA",
    composer: "Eugênio Fim",
    duration: "4:30",
    lyrics:
      "G9                              Em7​\n\nEntão, vou me embora​\n\nB7                         C7+/9​\n\nJá é hora de levantar​\n\n​\n\nG9                             Em7​\n\njá se foi toda história​\n\nB7                         C7+/9​\n\nse tiver que chorar, chora​\n\nB7                         C7+/9​\n\nNão é hora de lamentar​\n\n​\n\nG9                             Em7​\n\nEntão vou agora (vou agora)​\n\nB7                         C7+/9​\n\nTodo dia me levantar​\n\nG9                             Em7​\n\nE lembrar dessa história​\n\nB7                         C7+/9​\n\nComo um dia na memória​\n\n​\n\nB7                         C7+/9​\n\nJá é hora de levantar ​\n\nB7                         C7+/9​\n\nse tiver que chorar, chora​\n\nIntro:  ||:D    C7:|| 8x​\n\nCoisa que nao se pesa ​\n\nque nao se medi ​\n\nque entao se perde ​\n\nda tua vista ​\n\ncomo essa flor ​\n\nali parada sem teu amor​\n\n​\n\ncoisa que não se nega ​\n\nque não se pega ​\n\nEntão se abre ​\n\nna tua vista ​\n\ncomo essa flor ​\n\nali parada sem teu amor​",
    chords: "",
    briefing: "",
    syncedLyrics: "",
    youtubeUrl: "https://youtu.be/Hk1r-AZ8FwM",
    youtubeId: "Hk1r-AZ8FwM",
    audioKey: "tracks/audio/07-ja-e-hora.mp3",
    audioUrl: "/manus-storage/tracks/audio/07-ja-e-hora.mp3",
    isPublished: true,
    sortOrder: 6,
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run the seed script");
  }
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log(`Seeding ${trackData.length} tracks...`);
  for (const t of trackData) {
    await db.insert(tracks).values(t);
    console.log(`  ✓ ${t.title}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
