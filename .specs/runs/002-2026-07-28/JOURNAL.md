# Run 002 — 2026-07-28

**Status:** em andamento
**Orquestrador:** segunda execução da skill `spec-loop`
**Pedido:** `/spec-loop` sem argumento — varrer o que falta e executar

> **Antecedente:** a run 001 (`.specs/runs/001-2026-07-27/JOURNAL.md`) fechou com o trabalho de
> código concluído: C-03 e C-04 pagos (`generated-types` e `frontend-testing`), ~31 divergências
> de documentação corrigidas em 7 arquivos. O que ela deixou explicitamente **adiado, não
> concluído**, está na §Não verificado dela: os 5 itens de UAT autorizados pela decisão D1 e a
> reimportação de PDFs autorizada pela D2 — adiados por colisão com a migração de tipos.

---

## Fase 0 — Divergências encontradas

Subagent de auditoria despachado (`Explore`, leitura pura, não corrige). Missão ampliada em
relação à run 001: além de `STATE`/`ROADMAP`/`tasks.md` e dos 7 arquivos de `codebase/`, desta vez
entra o **`ROADMAP.md`** (que a run 001 registrou explicitamente como não varrido) e o
**`agent-briefs.md` da própria skill**, tratado como documentação sujeita à mesma auditoria.

### Achados do orquestrador, antes do relatório da auditoria

| # | Afirmação | Onde | O que o código/arquivo diz | Gravidade |
| --- | --- | --- | --- | --- |
| O1 | O campo `**Current Work:**` contém **saída de shell colada dentro da prosa** — o log completo do `vite build` (chunks, gzip) e os 49 nomes de teste do `node --test`, ~70 linhas | `.specs/project/STATE.md:4–76` | É corrupção literal de conteúdo: uma saída de comando foi colada no meio de uma frase, que reinicia em `**49**. **O que continua sem prova...**`. O arquivo mais importante do projeto tem o cabeçalho ilegível | **FALSO** (não é afirmação errada, é arquivo corrompido) |
| O2 | `**Last Updated:** 2026-07-27` e o Current Work descreve *"nenhuma task de código aberta nas **11** features"*, terminando na AD-050 | `.specs/project/STATE.md:3–4` | A run 001 terminou em 2026-07-28 e criou **duas features novas** (`generated-types`, `frontend-testing`) — hoje são **13**. O `AGENTS.md` já diz 13; o `STATE.md`, que é a fonte, não | **DESATUALIZADO** |
| O3 | *"`src/types.ts` espelha as structs Rust **À MÃO**. Mudou uma, mude a outra."* — no **Contexto comum colado em todo brief de subagent** | `.claude/skills/spec-loop/references/agent-briefs.md:32` | Falso desde a run 001: `src/types.ts` é gerado, com gate `types_export::tests::types_ts_matches_rust_structs`. **Todo subagent despachado por esta skill recebe a instrução de editar à mão um arquivo gerado** — e o gate faria o trabalho dele falhar | **FALSO** |
| O4 | Item 7 do checklist do validador: *"Se mexeu na fronteira Rust↔TS: `src/types.ts` acompanhou? **É à mão.**"* | `.claude/skills/spec-loop/references/agent-briefs.md:136` | Mesmo defeito, no papel que existe para pegar defeitos. O validador seria instruído a aprovar edição manual | **FALSO** |

O3/O4 são a mesma classe da L-007 e do C-01: a documentação sobrevive à mudança do código e passa
a ensinar o errado com autoridade. A diferença é que aqui a vítima é **todo subagent desta run**.

### Tabela da auditoria

| # | Afirmação | Onde | O que o código diz | Gravidade | Corrigido? |
| --- | --- | --- | --- | --- | --- |
| 1 | *"`src/types.ts` espelha as structs Rust À MÃO"* — no Contexto comum colado em **todo** brief | `agent-briefs.md:32` | Gerado desde 2026-07-28, com cabeçalho `GENERATED FILE`. O `AGENTS.md:157` já dizia o oposto do brief | **FALSO** | ✅ trocado pela instrução de regeneração + o argumento medido (os dois compiladores ficam calados) |
| 2 | Item 8 do checklist do validador: *"`src/types.ts` acompanhou? **É à mão.**"* | `agent-briefs.md:136` | Mesmo defeito, no papel que existe para pegar defeitos | **FALSO** | ✅ virou "rode `cargo test --lib types_export`", com o aviso de que `cargo check` e `npm run build` não falam |
| 3 | *"nesta data `src/types.ts` ainda é o arquivo escrito à mão"* | `codebase/ARCHITECTURE.md:119` | Falso desde 2026-07-28. Os outros **seis** documentos de `codebase/` foram corrigidos naquele dia; só este ficou para trás | **FALSO** | ✅ reescrito, com nota explicando que era prosa escrita como estado momentâneo e lida depois como fato |
| 4 | `cargo test --lib` **177 / 0 / 15** | `STATE.md:4,135`, `ROADMAP.md:238`, `TESTING.md:3`, `STACK.md:61` | Medido agora: **181 / 0 / 16**. O `AGENTS.md` já tinha o número certo; os outros quatro não acompanharam a sessão que o gerou | **DESATUALIZADO** | ✅ nos quatro. No `ROADMAP.md` o número foi **preservado como registro histórico** (diz o que era verdade quando a T9 passou) com o baseline atual anotado ao lado |
| 5 | Marcador `SPEC:` presente em **44 arquivos** | `codebase/CONVENTIONS.md:33` | **50** — `generated-types` e `frontend-testing` acrescentaram 6 | **DESATUALIZADO** | ✅ remedido |
| 6 | T11 de `documents-rag` com o critério de UAT em `- [ ]` | `features/documents-rag/tasks.md:276` | O `Status` do topo **do mesmo arquivo**, o `STATE.md` e o `ROADMAP.md` os três dizem que essa UAT foi executada em 2026-07-27 (AD-050). Só a caixa dizia pendente | **AUSENTE** | ✅ marcada `[x]` com a evidência medida (517 ms, 16,6 s) |
| 7 | `ROADMAP.md` nunca varrido atrás de número envelhecido | todo do `STATE.md` | Confirmado: o único número de teste Rust dele (linha 238) estava desatualizado | **AUSENTE** | ⏳ **varredura completa continua aberta** — a auditoria conferiu o ROADMAP contra os outros documentos, não linha a linha |

**Achados do orquestrador (O1–O4 acima), corrigidos:**

- **O1 — `STATE.md` corrompido.** As linhas 5–76 eram uma **duplicata da própria linha 4**, do caractere 1727 em diante, com quatro trechos substituídos: onde a prosa citava `npm run build` e `npm run test:scripts` ficou a **saída** desses comandos (o log do Vite e os 49 nomes de teste do `node --test`), e onde citava `delete_chat` e `master` ficou vazio. Verificado programaticamente: restaurando os dois identificadores comidos, a duplicata bate **caractere a caractere** com o trecho original. A linha 4 estava íntegra — as 72 linhas de lixo foram apagadas, nada de conteúdo se perdeu.
- **O2 — cabeçalho desatualizado.** `Last Updated` dizia 2026-07-27 e o Current Work falava em **11 features**. São **13**. Reescrito com os gates medidos nesta run.
- Cosmético, **não corrigido**: `## Recent Decisions (Last 60 days)` aparece **três vezes** no `STATE.md` (linhas 8, 765, 779) — artefato de append, não afirmação falsa. Fica registrado, não vale o risco de edição.

**Confirmado CORRETO (medido, não lido)** — importa saber o que não mexer: a próxima migração é a **9** (8 entradas em `MIGRATIONS`); **39** comandos Tauri; paridade i18n **148/148**; **19** componentes `.tsx` e **6** stores; `npm test` 63/8 e `test:scripts` 49; sidebar com 4 zonas; `SUBDIRS` = 5.

---

## Inventário

Fonte: `STATE.md` §Todos, o `Status`/`Execution Log` das **13** features, e `CONCERNS.md`.
**Zero tasks de implementação abertas nas 13 features** — confirmado pela auditoria feature a feature.
As pendências são todas de nível projeto.

| # | Item | Origem | Classificação |
| --- | --- | --- | --- |
| 1 | Publicar release nova a partir de `master` — a `v0.2.0` "Latest" é anterior ao M9 e está quebrada em runtime | AD-048 | `human-only` |
| 2 | Confirmar o `latest.json` portátil (URL com tag, HTTP 200) na próxima release | AD-048 | `human-only` |
| 3 | T24/M8: instalar `-setup.exe` sem admin, rodar o zip portátil, aplicar update de verdade nos dois modos | T24 | `human-only` |
| 4 | T22/M9: rede desligada, instalar → abrir → conversar → importar PDF | T22 | `human-only` |
| 5 | AppImage voltar a empacotar (`NO_STRIP=true`) | quick 005 | `human-only` (runner Linux) |
| 6 | Assinatura de código | AD-034 | `human-only` (certificado) |
| 7 | Open Questions do M8 (flag `--bundles`, plugin ignorar a chave portátil) | design M8 | `human-only` (só um `workflow_dispatch` real responde) |
| 8 | CRUD de chat do M1 pela UI (SHELL-01..07) | STATE §Todos | `uat-agent` |
| 9 | Correções da AD-027 pela UI (6 cenários) | STATE §Todos | `uat-agent` |
| 10 | C-14 clicando: apagar chat no meio da geração e ver o sidecar parar | STATE §Todos | `uat-agent` |
| 11 | Pasta-base renomeada com o app fechado → wizard reabre nomeando a pasta perdida | STATE §Todos | `uat-agent` |
| 12 | Remedir a pergunta do Art. 968 contra o corpus real (efeito da AD-036) | STATE §Todos | `uat-agent` |
| 13 | `ChatAttachment.status`: o badge mostra `parsing`/`chunking`/`embedding` ou pula direto? | AD gerada pela `generated-types` | `uat-agent` |
| 14 | Ligar `npm test` no `.github/workflows/ci.yml` — a suíte de 63 testes só roda quando alguém a chama | STATE §Todos | `code` |
| 15 | Varredura linha a linha do `ROADMAP.md` atrás de número envelhecido | STATE §Todos | `code` |
| 16 | Defeito de produção: `sendMessage` perde na tela o erro que gravou (`chatStore.ts:192` → `:207` → `:68`) | `frontend-testing` | `code`, mas **muda comportamento de produção** → decisão |
| 17 | Reimportar PDFs indexados antes de 2026-07-26 (texto corrompido do `pdf-extract`) | STATE §Todos | **decisão** — mexe na base de conhecimento real |
| 18 | Os 17 componentes React restantes sem teste | STATE §Todos | **decisão** — escopo novo, não é mais o C-04 |
| 19 | Documento irrelevante continua **entrando** no prompt | AD-050 | `blocked` (limiar absoluto descartado por medição: janela de **0,0073**) |
| 20 | `MEMORY_TOP_K = 1` / teto absoluto de distância na memória | AD-044/047 | `blocked` (precisa de conversa real com 2 turnos antigos relevantes) |
| 21 | `protoc` no README/STACK | STATE §Todos | `moot` — feito na run 001, conferido |
| 22 | C-03 e C-04 | CONCERNS | `moot` — pagos na run 001 |
| 23 | Ícones padrão do template no bundle | STATE §Todos | `moot` — 10 removidos na run 001 |

**Leitura:** 7 `human-only`, 6 `uat-agent`, 3 `code`, 2 `decisão`, 2 `blocked`, 3 `moot` (riscados na Fase 0).

---

## Decisões pendentes do usuário (Fase 2)

Escrito ANTES da primeira pergunta. Uma run interrompida no interrogatório retoma daqui sem
refazer o levantamento nem repetir pergunta já respondida.

| # | Pergunta | Por que só o usuário responde | Resposta | Data |
| --- | --- | --- | --- | --- |
| D1 | Autorizo dirigir o app contra os **dados reais** para executar os 6 itens de UAT, criando chats/documentos de teste e restaurando depois? | A run 001 obteve esse "sim" em 2026-07-27 e **nunca o usou** — os itens foram adiados por colisão com a migração de tipos. São as conversas dele; autorização concedida e não exercida numa sessão anterior não se herda em silêncio | | |
| D2 | Reimportar os PDFs indexados antes de 2026-07-26? | Mexe na **base de conhecimento real**. Mesma situação da D1: autorizado na run 001, não executado | | |
| D3 | Corrigir o defeito do `sendMessage` agora? Ele muda comportamento de produção da `chat-messaging` e **faz o teste de caracterização falhar de propósito** | Escolha de produto sobre qual spec muda, não escolha técnica | | |
| D4 | Os 17 componentes React sem teste entram nesta run? | O próprio todo argumenta que só vale com critério de risco por componente, em vez de cobertura por cobertura — decisão de escopo | | |

**Não perguntado de propósito** (o repositório já responde): os itens 14 e 15 são `code` sem
ambiguidade — ligar `npm test` no CI tem o pré-requisito pago (a suíte existe e passa), e a
varredura do `ROADMAP.md` tem o padrão definido e é o único todo de documentação que sobrou.
Executo sem perguntar.

Os 7 `human-only` não viram pergunta: não há decisão, há uma tarefa que é do mantenedor.

---

## Execução

_(preenchido a cada task)_

---

## Gates medidos nesta run

Medidos pelo subagent de auditoria com a árvore parada (nenhum agente editando):

| Gate | Resultado | Tempo |
| --- | --- | --- |
| `cd src-tauri && cargo test --lib` | **181 passando / 0 falhas / 16 ignorados** | 7,03 s |
| `npm run build` | limpo — tsc + Vite, 1859 módulos | 5,68 s |
| `npm test` | **63 passando em 8 arquivos** | 2,88 s |
| `npm run test:scripts` | **49 passando / 0 falhas** | 115 ms |

Idênticos ao fechamento da run 001 — nada regrediu entre as duas runs.

---

## Working tree no último checkpoint

_(atualizado a cada checkpoint)_

---

## Não verificado

_(obrigatório — preenchido ao fim)_
