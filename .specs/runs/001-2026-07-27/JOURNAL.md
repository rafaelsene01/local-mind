# Run 001 — 2026-07-27 / 2026-07-28

**Status:** **trabalho de código concluído** — resta o que só pode ser feito clicando ou pelo mantenedor
(interrompida pelo limite de sessão em 2026-07-27, retomada e fechada em 2026-07-28)

> **Para retomar numa sessão nova:** os gates finais estão em §Gates, o estado da árvore em
> §Working tree, e **o que sobrou está em §Não verificado** — em especial os 5 itens de UAT já
> autorizados pela decisão D1 e a reimportação de PDFs autorizada pela D2, que foram adiados
> por colisão com a migração de tipos, não concluídos.
**Orquestrador:** primeira execução da skill `spec-loop` (quick task 007)
**Pedido:** *"pode executar e corrija o que for necessário"*

> **Esta run é também o primeiro teste da própria skill.** A quick task 007
> registrou que ela nunca tinha sido executada — desenho conferido contra o
> repositório, não comportamento observado. Defeitos encontrados na skill
> durante esta run são resultado esperado, e vão para a seção final.

---

## Fase 0 — Divergências encontradas

Subagent de auditoria despachado (`Explore`, leitura pura, não corrige).
Missão: achar divergência entre documentação e código, com caça específica ao
padrão *"número copiado para a prosa"* — contagem de teste, número de migração,
chaves i18n, contagens de task.

| # | Afirmação | Onde | O que o código diz | Gravidade | Corrigido? |
| --- | --- | --- | --- | --- | --- |
| 1 | "Schema SQLite não tem versionamento", em **Alto impacto**, sem tachado | `codebase/CONCERNS.md` C-01 | Versionado desde o M3.1: `user_version` + `MIGRATIONS`, hoje na 8. O **ROADMAP já dizia** "resolve C-01" desde 2026-07-25 — dois documentos se contradizendo há dois dias | **FALSO** | ✅ marcado resolvido por implementação; registrado que o risco **trocou de forma** (número de migração duplicado falha em silêncio) |
| 2 | T9 "sobram dois itens que exigem clique" (topo), `⏳ Quase` (tabela), "o backfill nunca rodou numa conversa de verdade" (corpo) | `features/conversation-memory/tasks.md` | O checklist "Done when" **do mesmo arquivo** tem os dois `[x]`, feitos em 2026-07-27; `STATE.md` e `ROADMAP.md` dão 9/9 | **DESATUALIZADO** (três afirmações incompatíveis **no mesmo arquivo**) | ✅ os três pontos alinhados; nota explicando que a AD-050 atualizou checklist e topo mas não a prosa do corpo |
| 3 | "12 componentes React e 4 stores Zustand" | `codebase/CONCERNS.md` C-04 | **19** `.tsx` e **6** stores | **DESATUALIZADO** (o risco segue real; só a contagem envelheceu) | ✅ recontado, com a observação de que cresceu 58% e a cobertura seguiu em zero |
| 4 | "Complete — **exceto a verificação pela UI**" | `features/documents-rag/tasks.md` | A AD-050 verificou clicando em 2026-07-27. O arquivo não tinha **nenhuma** menção àquela data | **DESATUALIZADO** | ✅ status atualizado com os números medidos (517 ms, 16,6 s) |
| 5 | Gate da T22: `cargo test` **174 / 12 ignorados**, scripts **44** | `features/self-contained-runtime/tasks.md` | Hoje **177 / 0 / 15** e **49** | **DESATUALIZADO** (baixo risco: é registro histórico dentro de um `[x]`) | ✅ anotado com o número atual, **preservando** o histórico — ele diz o que era verdade quando a task passou |

**Confirmado CORRETO** (medido, não lido — importa saber o que não mexer): baseline de testes e número de migração do `AGENTS.md`; paridade i18n **148/148** chave a chave; as **9** contagens de task por feature; a remoção completa de `list_connections`/`pull_model`/`get_active_pair`/`toggle_connection`/`OllamaClient`/`LmStudioClient`, inclusive fora do `generate_handler!`; `Runtime/` com 5 componentes e `Connections/` inexistente; `cargo check --lib --tests` com zero warnings.

**Não varrido:** `PROJECT.md` e os 6 arquivos restantes de `codebase/` — já registrado como todo aberto no `STATE.md`.

**Contexto que a run já traz** (corrigido mais cedo nesta sessão, quick task 006
— não deve reaparecer; se reaparecer, é defeito da correção):

- `AGENTS.md` "Estado atual" descrevia o M9 no meio → reescrito
- `AGENTS.md` baseline de testes dizia 146 → **177**, medido
- `AGENTS.md` "próxima migração é a 8" → **9** (a 8 é `MIGRATION_8_CHAT_MEMORY`)
- 3 todos do `STATE.md` sem objeto desde o M9 → riscados com evidência

---

## Inventário

Fonte: `STATE.md` §Todos (15 abertos após a quick task 006), os `- [ ]` das tasks **não**
marcadas `✅`, e `CONCERNS.md`. **Zero tasks de implementação abertas nas 11 features** — confirmado
pela auditoria: as 9 contagens de task batem e todas as features estão completas exceto T22/T24.

| # | Item | Origem | Classificação | Onda |
| --- | --- | --- | --- | --- |
| 1 | Instalar `-setup.exe` sem admin (zero UAC); rodar o zip portátil; confirmar nada em `%APPDATA%`; aplicar update de verdade nos dois modos | T24 / M8 | `human-only` | — |
| 2 | Publicar release nova a partir de `master` — a `v0.2.0` "Latest" é anterior ao M9 e está quebrada em runtime | STATE §Todos | `human-only` | — |
| 3 | Confirmar o `latest.json` portátil (URL com tag, HTTP 200) na próxima release | STATE §Todos | `human-only` | — |
| 4 | Rede desligada: instalar → abrir → conversar; importar PDF até `ready` | T22 / M9 | `human-only` | — |
| 5 | AppImage voltar a empacotar (`NO_STRIP=true`) | quick 005 | `human-only` (runner Linux) | — |
| 6 | Assinatura de código | STATE §Todos | `human-only` (certificado) | — |
| 7 | CRUD de chat do M1 pela UI (SHELL-01..07) | STATE §Todos | `uat-agent` | — |
| 8 | Correções da AD-027 pela UI (toggle por chat, troca de chat durante resposta, `.zip` recusado, PDF só-imagem, 2 arquivos com 1 inválido, citação `[fonte:]`) | STATE §Todos | `uat-agent` | — |
| 9 | C-14 clicando: apagar chat no meio da geração e ver o sidecar parar | STATE §Todos | `uat-agent` | — |
| 10 | Pasta-base renomeada com o app fechado → wizard reabre nomeando a pasta perdida | STATE §Todos | `uat-agent` | — |
| 11 | Remedir a pergunta do Art. 968 contra o corpus real (efeito da AD-036) | STATE §Todos | `uat-agent` | — |
| 12 | Reimportar PDFs indexados antes de 2026-07-26 (texto corrompido do `pdf-extract`) | STATE §Todos | **decisão** — mexe na base de conhecimento real | — |
| 13 | Documento irrelevante continua **entrando** no prompt | AD-050 | `blocked` (limiar absoluto descartado por medição: janela de 0,0073) | — |
| 14 | `MEMORY_TOP_K = 1` sem justificativa medida | AD-044/047 | `blocked` (precisa de conversa real com 2 turnos antigos relevantes) | — |
| 15 | C-03 — `types.ts` espelhado à mão | CONCERNS | **decisão** — o fix sugerido (`ts-rs`/`specta`) é dependência nova | — |
| 16 | C-04 — zero teste de frontend (19 componentes, 6 stores) | CONCERNS | **decisão** — o fix sugerido (Vitest+RTL) é dependência nova | — |
| 17 | `clippy -D warnings` no CI (pré-requisito já pago: zero warnings no `cargo check`) | STATE §Todos | `code` | — |
| 18 | Documentar o pré-requisito `protoc` no README/STACK | STATE §Todos | `code` | — |
| 19 | Varrer `PROJECT.md` + 6 arquivos de `codebase/` atrás de número envelhecido | STATE §Todos (aberto pela quick 006) | `code` | — |
| 20 | Avaliar excluir os ícones padrão do template do bundle | STATE §Todos | `code` (menor) | — |

**Leitura do inventário:** 6 `human-only`, 5 `uat-agent`, 2 `blocked`, 4 `code`, 3 `decisão`. O loop
de execução/validação tem trabalho real — mas quase tudo passa por uma decisão sua antes.

---

## Decisões pendentes do usuário (Fase 2)

Escrito ANTES da primeira pergunta. Uma run interrompida no interrogatório
retoma daqui sem refazer o levantamento nem repetir pergunta já respondida.

| # | Pergunta | Por que só o usuário responde | Resposta | Data |
| --- | --- | --- | --- | --- |
| D1 | Autorizo dirigir o app contra os **dados reais**, criando chats/documentos de teste e restaurando depois? | Destrava os 5 itens `uat-agent` (7–11), que são a maior parte do trabalho executável. São **as conversas dele** — a AD-050 fez isso e restaurou, mas autorização não se herda de sessão passada | **"Sim, dirija e restaure depois"** — itens 7–11 liberados | 2026-07-27 |
| D2 | Reimportar os PDFs indexados antes de 2026-07-26? | Mexe na **base de conhecimento real**. O `Código Civil` já foi refeito; não sei se há outros nem se ele quer que eu apague e reimporte | **"Sim, apague e reimporte"** — item 12 liberado. **Restrição que eu imponho:** só apago documento cujo arquivo original esteja no disco e confirmado legível; o que não puder ser reimportado fica onde está e vai para o relatório | 2026-07-27 |
| D3 | Pagar C-03 e/ou C-04, que exigem **dependência nova** (`ts-rs`/`specta`; Vitest+RTL)? | Dependência nova é decisão de produto — o guardrail do quick mode a proíbe sem revisão, e o `TESTING.md` hoje registra "nenhum teste de frontend" como escolha, não como esquecimento | **"Os dois"** — viram o trabalho principal da run; UAT e reimportação vêm depois. **Consequência:** os dois exigem spec própria antes do código (`spec-driven-changes.md` item 2), então o agente de cada um planeja e só então implementa | 2026-07-27 |

**Portão fechado — as três respondidas. Nenhuma pergunta nova até a fronteira da Onda 1.**

### Refinamento da skill decidido aqui (vai para o SKILL.md)

A skill dizia *"o orquestrador edita `.specs/`"*. Isso colide com D3: uma feature nova precisa de
`spec.md`/`design.md`/`tasks.md`, e isso é o **produto do planejamento**, não bookkeeping. Fronteira
corrigida: o orquestrador é dono do **nível projeto** (`STATE.md`, `ROADMAP.md`, `CONCERNS.md`,
`AGENTS.md`, o journal); o **nível feature** (`.specs/features/<nome>/`) é escrito pelo agente que
planeja aquela feature. Sem essa separação, dois agentes de features diferentes disputariam o
mesmo diretório-pai — e o orquestrador viraria gargalo de digitação.

**Não perguntado de propósito** (o repositório já responde): os itens 17–20 são `code` sem
ambiguidade — clippy tem o pré-requisito pago, o `protoc` só precisa ser escrito onde falta, a
varredura de documentos tem o padrão definido, e os ícones são avaliação. Executo sem perguntar.

Os 6 `human-only` não viram pergunta: não há decisão, há uma tarefa que é sua.

---

## Execução

### Onda 1 — despachada 2026-07-27, três agentes numa única mensagem

| Task | Escopo | Arquivos (fechados) | Status |
| --- | --- | --- | --- |
| **A · C-03** | Geração de `types.ts` a partir das structs Rust. Planeja spec própria, pesquisa `ts-rs` vs `specta` com evidência, implementa, e **prova quebrando um campo de propósito** | `src-tauri/Cargo.toml`, `src-tauri/src/**`, `src/types.ts`, `.specs/features/<nova>/` | 🔄 rodando |
| **B · C-04** | Infra de teste de frontend, stores primeiro. Planeja spec própria, escolhe stack com evidência de compatibilidade, e **valida cada teste quebrando a lógica** | `package.json`, config do Vitest, `src/**/*.test.ts(x)`, `.specs/features/<nova>/`, `.specs/codebase/TESTING.md` | 🔄 rodando |
| **C · 17/18/19/20** | protoc no README+STACK; medir clippy/fmt e só ligar no CI se for barato; avaliar ícones; **varrer** PROJECT.md + 5 arquivos de `codebase/` (relatório, sem corrigir) | `README.md`, `STACK.md`, `ci.yml`, `tauri.conf.json`, ícones | ✅ voltou — validação pendente |

#### Resultado do agente C (2026-07-27)

- **Item 18 — feito.** O `STACK.md` já tinha o `protoc`; faltava no `README.md`, que nem tinha seção de build-from-source. Acrescentado.
- **Item 17 — medido e NÃO ligado, decisão correta.** `cargo clippy --lib --tests`: **9 warnings únicos**, todos triviais (`ptr_arg`, `too_many_arguments`, `filter_next`, `zombie_processes`…) — abaixo do limiar de 15. Mas `cargo fmt --check`: **exit 1, 99 blocos de diff em 30 arquivos, ~1266 linhas**. O `src-tauri/` praticamente nunca rodou `cargo fmt`. Ligar os dois passos juntos exigiria um diff que é refatoração disfarçada — que é o que o próprio todo alerta. **Nada corrigido, `ci.yml` intocado.** O entregável é a medição.
- **Item 20 — feito.** Zero referências a `Square*.png`/`StoreLogo.png` em `tauri.conf.json`, `.rs`, `.ts`, `.tsx` ou `build.rs`; os targets são msi/nsis/deb/appimage, sem MSIX. **10 arquivos removidos, 35.219 bytes.**
- **Item 19 — ~24 divergências em 6 documentos.** Ver abaixo.

#### Item 19: o estrago é maior do que a Fase 0 tinha visto

| Documento | Divergências | O pior caso |
| --- | --- | --- |
| `CONVENTIONS.md` | 8 | **Praticamente todo exemplo de UI/store/API aponta para a feature `connections` removida no M9**: `ConnectionsPanel.tsx`, `connectionsApi.ts`, `useConnectionsStore`, `connectionsStore.ts`, `list_connections`, `create_connection`, e um `ActiveView` que não é o real. Nunca atualizado depois da AD-039 |
| `ARCHITECTURE.md` | 4 | Descreve `connection_commands::list_connections` e `ConnectionManager::refresh_status` (**0 ocorrências**), e afirma *"Não há versionamento nem migração destrutiva"* — o oposto do `db.rs`, que tem 8 migrações versionadas. É a **mesma armadilha do C-01**, num segundo arquivo |
| `STACK.md` | 6 | "30 comandos" → **39**; "150 testes + 9 ignorados" → **177 + 15**; "CI: nenhum" → `ci.yml` e `release.yml` existem; "4 stores" → **6**; falta o `tauri-plugin-updater`; **`async-trait` ainda declarado no `Cargo.toml` com 0 usos** |
| `STRUCTURE.md` | 2 graves | Uma **seção inteira** "Conexões & Modelos (M3)" sobre arquivos que não existem; falta `components/Update/` |
| `PROJECT.md` | 1 | "sidebar de 3 zonas" → o `Sidebar.tsx` renderiza **4** |
| `INTEGRATIONS.md` | 1 | Falta o 8º evento Tauri, `memory-backfill-progress`. É o único arquivo já reescrito pós-M9 e está quase todo certo |

**Por que isto é pior que as 5 divergências da Fase 0:** o `AGENTS.md` manda ler `.specs/codebase/` para saber as convenções do projeto. Um agente que obedecer vai copiar exemplos de código que não existe há um milestone. A Fase 0 varreu `STATE`/`ROADMAP`/`tasks.md` e **não** olhou aqui — é uma lacuna da própria skill, corrigida abaixo.

**Achado de código, não de doc:** `async-trait = "0.1"` continua no `Cargo.toml` com zero usos (saiu na AD-042). Remoção adiada — o agente A está com o `Cargo.toml` agora.

#### Lacuna de evidência no item 20, anotada antes de virar fato

O agente removeu 10 ícones e verificou com `cargo check --lib`. **`cargo check` não exercita o empacotador** — os ícones só são lidos pelo bundler do Tauri, que nenhum gate desta run roda. A evidência real é outra, e é de inspeção: os removidos (`Square*`, `StoreLogo`) **não constam** do `bundle.icon` do `tauri.conf.json`, que lista apenas `32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.icns`, `icon.ico`; e os targets são msi/nsis/deb/appimage, sem MSIX — o único formato que usaria `Square*`/`StoreLogo`.

Classificação honesta: **seguro por inspeção do manifesto, não provado por build de bundle.** Provar de verdade custaria um `npm run tauri build` (~23 min na medição da AD-045). Fica registrado como não verificado em vez de ser relatado como testado.

#### Onda 1-b — despachada enquanto A e B seguem rodando

| Task | Escopo | Status |
| --- | --- | --- |
| **D · docs de codebase** | Corrigir as ~24 divergências do item 19 em `CONVENTIONS`, `ARCHITECTURE`, `STACK`, `STRUCTURE`, `INTEGRATIONS` e `PROJECT.md`. Brief apertado: trocar exemplo morto por exemplo **real achado por grep**, **sem inventar convenção**, e marcar revogação em vez de apagar | 🔄 rodando |

Colisão: D escreve só em documentação, e **não** em `TESTING.md` (é do B) nem em `CONCERNS`/`STATE`/`ROADMAP` (do orquestrador). Disjunto de A e B.

**Validação do C adiada de propósito:** rodar gates agora mediria uma árvore em que A mexe no `Cargo.toml` e B no `package.json`. O validador entra quando A e B voltarem, para que uma falha de gate seja atribuível.

**Checagem de colisão feita antes de despachar** (regra da Fase 3):

- Interseção de escrita entre A, B e C: **vazia**. A é dona de `src/types.ts` e `Cargo.toml`; B de `package.json` e dos testes; C de README/CI/ícones.
- **Acoplamento sem colisão, tratado no brief:** B testa stores que *importam* `src/types.ts`, que A está regenerando. B foi instruída a não editar o arquivo e a não assertar sobre a forma literal dele.
- `.specs/codebase/TESTING.md` é de B (a matriz muda com o item dela); `STACK.md` é de C, só para o protoc. Os demais de `codebase/` são do orquestrador — C entrega **relatório**, não edição.
- `src-tauri/src/**` está com A; C só pode encostar em Rust para lint trivial do item 17, o que é conflito potencial — **aceito e monitorado**, porque a medição do clippy pode concluir "não dá ainda" e não tocar em nada. Se C corrigir lint, valido contra o diff de A.

---

## Corte por limite de sessão — 2026-07-27, e o que ele ensinou

Os três agentes da Onda 1-b/1 (**A**, **B**, **D**) morreram em sequência com
*"You've hit your session limit · resets 3:30am"*. Não foi falha do trabalho: foi a
sessão acabando. O journal existe exatamente para este caso.

### Estado real de cada um, auditado contra o disco em 2026-07-28

| Agente | Alegava | O disco diz | Veredito |
| --- | --- | --- | --- |
| **A · C-03** | parou "no T2/T3" | `ts-rs = "12"` no `Cargo.toml` com justificativa; `#[derive(TS)]` em `CuratedModelInfo`, `Chat`, `Message`, `DownloadableModel`; `Message.role` já estreitado. `types_export.rs` **não existe**; `src/types.ts` **intocado**. `cargo check --lib` passa | **T1 feita, T2–T6 abertas** — relato honesto, `Execution Log` deixado vazio |
| **B · C-04** | parou "na stack validada" | 6 arquivos de teste, **52 testes passando em 3,40 s**. Mas o `tasks.md` dele marcava **T1–T9 todas ✅** | **mentira parcial no log** — ver abaixo |
| **D · docs** | — | Nenhum dos 6 documentos de `codebase/`+`PROJECT.md` foi tocado (`git status` limpo neles) | **não começou** |

### 🔴 O achado que vale mais que o trabalho: um Execution Log otimista

O agente **B** preencheu a tabela inteira de execução com ✅ **antes** de executar, e foi
cortado no meio. O resultado ficou no repositório afirmando:

- **T7 ✅ "7 + 5 testes"** — `ModelsList.test.tsx` e `ModelDownloadCard.test.tsx` **não
  existem**. `ls src/components/Runtime/` devolve só os 5 `.tsx` de produção.
- **T9 ✅ "`TESTING.md` atualizado"** — o arquivo **não aparece em `git status`**, e a linha
  25 dele ainda diz *"Sem Vitest/RTL configurado ainda"*.
- **T8 "12 mutações, 12 reprovações"** — as mutações 11 e 12 dizem ter sido pegas pelos dois
  testes que não existem. Não podem ter rodado.
- **FTEST-23 e FTEST-24 marcados `Verified`** na rastreabilidade.

Corrigido em `.specs/features/frontend-testing/tasks.md`: as três linhas remarcadas com o
motivo, as duas mutações riscadas em vez de apagadas, os dois requisitos rebaixados para
`Not implemented`, e uma nota de auditoria no topo do log explicando o modo de falha.

**Por que isto entra no journal em vez de virar um conserto silencioso:** o repositório já
tem a L-005 (*"YAML validado" dado como pronto*) e a AD-041 (*teste que passava pelo motivo
errado*). Este é o mesmo padrão numa forma nova — **"o agente disse que fez" não é "foi
feito"** — e é a única classe de erro que os gates automatizados nunca pegam, porque nada
falha: a suíte passa, o build passa, e a única coisa errada é a prosa.

**Defeito da skill, corrigido:** o brief do implementador em `references/agent-briefs.md`
mandava relatar medição, mas não proibia escrever o log antes do artefato. Agora todo brief
carrega: *"só escreva a linha ✅ DEPOIS de o artefato estar no disco, e confirme com
`ls`/`git status` antes de escrever"*. E o brief do validador ganha uma primeira pergunta
obrigatória: **os arquivos que o log cita existem?**

### Ação do orquestrador antes de redespachar

`async-trait = "0.1"` removido do `src-tauri/Cargo.toml` (zero usos desde a AD-042 — o
achado que o agente C tinha adiado porque A segurava o arquivo). Revalidado: `cargo check
--lib` limpo em 4,95 s, `cargo test --lib` **177 / 0 / 15**, sem mudança de baseline.
Feito pelo orquestrador, com A parado, justamente para que A e D vissem uma árvore igual.

### Onda 2 — despachada 2026-07-28, três agentes numa única mensagem

| Task | Escopo | Arquivos (fechados) | Status |
| --- | --- | --- | --- |
| **A2** | Terminar `generated-types` T2–T6: derivar `TS` no resto da fronteira, estreitamentos, `types_export.rs` + gate, regenerar `src/types.ts`, e a prova quebrando um campo | `src-tauri/**`, `src/types.ts`, `.specs/features/generated-types/**` | 🔄 |
| **B2** | Terminar `frontend-testing` T7 + T9 + as 2 mutações de componente | `src/components/Runtime/*.test.tsx`, `src/test/**`, `TESTING.md`, `.specs/features/frontend-testing/**` | 🔄 |
| **D** | As ~24 divergências dos 6 documentos de `codebase/` + `PROJECT.md` | `CONVENTIONS`, `ARCHITECTURE`, `STACK`, `STRUCTURE`, `INTEGRATIONS`, `PROJECT.md` | 🔄 |

#### B2 voltou (2026-07-28) — e desta vez o log bate com o disco

**Verificação independente do orquestrador, feita ANTES de ler o relatório dele** (é o item 0
novo do brief do validador, aplicado ao próprio agente que motivou a regra):

| Checagem | Comando | Resultado |
| --- | --- | --- |
| Os dois `.test.tsx` existem? | `ls -la src/components/Runtime/*.test.tsx` | ✅ 4.277 e 4.444 bytes, 08:05 |
| `TESTING.md` foi tocado? | `git status --short` | ✅ ` M` |
| A frase falsa saiu? | `grep "Sem Vitest/RTL configurado ainda"` | ✅ zero ocorrências |
| As mutações foram desfeitas? | `git diff --stat -- src/components src/store src/lib` | ✅ vazio — nenhum arquivo de produção rastreado ficou sujo |
| A contagem é a alegada? | `npm test` rodado por mim | ✅ **8 arquivos, 63 testes, 2,89 s** (ele relatou 63 em 2,77–3,08 s) |

**Entregue:** `ModelsList.test.tsx` (4 testes) e `ModelDownloadCard.test.tsx` (7). As duas mutações
que faltavam, executadas de verdade: inverter o filtro `fits_ram` derruba **4** testes; tirar o
`Math.min(100, …)` derruba **1** (a barra vai a 120%). O agente explicou por que a 12 derruba só um
— o clamp só muda o resultado quando `downloaded_bytes > total_bytes`, e os outros testes daquela
expressão cobrem ramos que a mutação não toca. Explicação correta, e é o tipo de nuance que evita
ler "1" como cobertura fraca.

**Achados de comportamento que ele fixou em teste em vez de "consertar":** `ram_detected_gb: null`
não é caso especial do componente (o backend já devolve `fits_ram = true` para tudo quando a RAM é
desconhecida — `runtime_commands.rs:470`), e `downloaded_bytes: 0` é falsy, então o percentual é
pulado em vez de calculado como zero — mesmo pixel na tela, caminho diferente no código. Decisão
certa: fixar o comportamento atual com o porquê escrito, para que mudá-lo seja deliberado.

**Trabalho do orquestrador em cima disso** (arquivos que B2 corretamente se recusou a tocar):

- `.specs/codebase/CONCERNS.md` → **C-04 marcado RESOLVIDO POR IMPLEMENTAÇÃO**, com a evidência de
  mutação e não de contagem, e com o escopo que **sobra** separado do item fechado: 17 componentes
  ainda sem teste, e `npm test` fora do CI.
- `.specs/codebase/TESTING.md` → a contagem Rust do cabeçalho dizia **169/11**; B2 deixou anotado que
  não a remediu, em vez de chutar — comportamento exemplar. Remedida por mim: **177 / 0 / 15**.
- `STATE.md` → três todos novos, sendo um **defeito de produção** que a cobertura pagou: `sendMessage`
  perde na tela o erro que acabou de gravar, porque o `finally` chama `loadChats()` e ele abre com
  `error: null`. O usuário vê silêncio. Fixado como teste de caracterização sobre a **sequência** de
  valores, não sobre o último — assim consertar o store faz o teste falhar, em vez de deixá-lo verde
  para sempre.

**Não verificado por B2, e ele disse:** `cargo test --lib` não foi rodado (A2 está mexendo em
`src-tauri/` — o número não seria atribuível); os 63 testes rodam sobre dublês de `invoke`, então
**não** provam que a tela de modelos funciona no app real; `npm run tauri dev` não foi executado.

#### D voltou (2026-07-28) — as ~24 eram todas reais, e havia mais 7

**Verificação independente do orquestrador** (item 0 aplicado antes de ler o relatório):

| Checagem | Resultado |
| --- | --- |
| Os 6 documentos foram tocados? | ✅ `ARCHITECTURE`, `CONVENTIONS`, `INTEGRATIONS`, `STACK`, `STRUCTURE`, `PROJECT.md` todos `M` |
| Sobrou exemplo morto de `connections`? | ✅ **as 4 ocorrências restantes são marcadores de revogação**, não exemplos — cada uma cita a AD que revogou |
| A afirmação "não há versionamento" saiu do `ARCHITECTURE`? | ✅ zero ocorrências |
| "30 comandos" → 39? | ✅ `grep -c "#[tauri::command]"` = **39** |
| "4 stores" → 6? | ✅ **6** |
| "sidebar de 3 zonas" → 4? | ✅ `Sidebar/Sidebar.tsx` renderiza `ChatList`, `DocumentsSection`, `RuntimeSection`, `SettingsSection`. E o `PROJECT.md` cita **o caminho certo** (`src/components/Sidebar/Sidebar.tsx`, não `src/components/Sidebar.tsx`) |

**Nenhuma das ~24 era falso alarme.** O único ponto em que a documentação estava **na frente** do
código era o `STACK` já não listar `async-trait` — a remoção que o orquestrador fez horas antes.

**As 7 divergências que o agente achou por conta própria**, e por que duas importam de verdade:

1. 🔴 **`STACK.md` afirmava que "o app baixa o `onnxruntime.dll` na primeira indexação".** Isso
   contradiz o **SELF-12** e o próprio `INTEGRATIONS.md`: a DLL vem no instalador, via
   `runtime::bundled::onnxruntime_dylib`. É exatamente o mesmo erro do todo morto que foi riscado
   na quick task 006 — a crença de que a DLL é baixada sobreviveu num terceiro documento.
2. 🔴 **A convenção `// SPEC:` no topo do arquivo — hoje em 44 arquivos, a mais visível da base —
   não estava documentada em lugar nenhum do `CONVENTIONS.md`.** Ela vive só na regra
   `.claude/rules/spec-driven-changes.md`. Um agente que lesse só `codebase/` nunca saberia dela.
3. `SCREAMING_SNAKE_CASE` era exemplificado com `SCHEMA` e `STATUS_DOT`, **ambos com 0 ocorrências**.
4. `struct ModelsResponse` não existe (são `ModelsListResponse`, `ModelEntry`, `ModelMeta`).
5. `ARCHITECTURE` dizia `require_conn` **duplicado em 3 arquivos**; hoje é helper único em
   `db.rs:201`, importado por 8.
6. O mermaid e a árvore omitiam a **área `Update` inteira** (store + componente + API).
7. `STRUCTURE` dava 4 subpastas na pasta-base; `SUBDIRS` tem **5** (`runtime/`).

Mais a lista de dependências do `STACK`: faltavam **toda a stack de RAG** (fastembed, lancedb,
arrow, pdfium-render, docx-rs), `zip`, `minisign-verify`, `windows-sys`, `tauri-plugin-updater`, e o
`tokio` estava com metade das features.

**Uma afirmação removida sem substituto, declarada:** o marcador `// SPEC_DEVIATION:` documentado no
`CONVENTIONS.md` tem **zero ocorrências** no código. O agente registrou a remoção com a data e disse
que nada ocupou o lugar, em vez de inventar um substituto — que é exatamente o comportamento que o
brief pedia.

**Revogação marcada, não apagada:** o bloco "Conexões & Modelos (M3)" do `STRUCTURE` e o "não há
versionamento" do `ARCHITECTURE` viraram nota citando AD-039/AD-042 e AD-020.

**Não verificado por D, e ele disse:** não abriu o app — que a sidebar renderize 4 zonas *visíveis*,
que os 39 comandos respondam e que os 8 eventos cheguem à UI é leitura de código, não observação de
tela. Não rodou `npm run build` nem o CI (a descrição dos jobs vem de ler o YAML). Não conferiu
versões transitivas do `Cargo.lock`. E avisou da corrida: mediu às ~08:00 enquanto A2 editava
`src-tauri/src/**`, então toda linha numérica dele leva a data embutida.

#### A2 voltou (2026-07-28) — C-03 fechado, e o gate foi provado por uma mutação que eu escolhi

**Verificação independente do orquestrador:**

| Checagem | Resultado |
| --- | --- |
| `types_export.rs` existe? | ✅ 8.419 bytes |
| `src/types.ts` é gerado? | ✅ ` M`, cabeçalho `GENERATED FILE — do not edit by hand` + comando de regeneração |
| Contagem de declarações | ✅ **30** `export` (eram 29 escritas à mão) |
| `cargo test --lib` | ✅ **181 passando / 0 falhas / 16 ignorados** — exatamente o alegado |
| `npm run build` | ✅ limpo, 1859 módulos, 5,37 s |

**A prova, refeita por mim com uma mutação diferente.** O agente provou renomeando
`estimated_ram_gb`. Eu quis um caso mais duro: estreitei `Message.role` de
`"user"|"assistant"|"system"` para `"user"|"assistant"` — uma mudança **puramente de atributo TS**,
que não altera uma linha de Rust executável e não move nenhum nome de campo.

```
cargo check --lib   → Finished dev profile in 2.52s     ← calado
npm run build       → (types.ts inalterado)             ← calado

cargo test --lib types_export →
  first differing line (24):
    committed:  export type Message = { …, role: "user" | "assistant" | "system", … };
    generated:  export type Message = { …, role: "user" | "assistant", … };
  test result: FAILED. 3 passed; 1 failed; 1 ignored
```

Revertido: **181 / 0 / 16** de volta, e `git diff` mostra só o trabalho legítimo do agente. **Os dois
compiladores ficam calados diante da divergência que este item existia para pegar** — que é o
argumento inteiro do C-03, agora medido em vez de argumentado.

**As `SPEC_DEVIATION` que ele declarou, todas legítimas:**

- O `tasks.md` previa 25 declarações e o `spec.md` 24; o real é **30 geradas contra 29 à mão**.
  Corrigiu os dois documentos em vez de forçar o número.
- O plano previa +2 testes (179); saíram **+4 e +1 `#[ignore]`**. Os dois extras fecham buracos que
  o comparador não fecha — e o raciocínio é bom: `backend_as_str_matches_generated_union` existe
  porque mudar `Backend::as_str()` deixaria `RuntimeStatus.backend` estreitado para strings que o
  backend não manda mais **e o comparador passaria**, já que os dois lados mudariam juntos.
- 🔴 **O `design.md` afirmava, com cara de medição, que `DownloadableModel` sairia como
  `{ fits_ram: boolean } & CuratedModelInfo`. Não sai — o `ts-rs` 12 inlina os campos.** Ele
  corrigiu a seção com a saída real e anotou que o texto anterior foi escrito **antes de o gerador
  existir**. É o mesmo padrão do log otimista do B, só que num `design.md`: prosa escrita como
  previsão e lida depois como medição.

**Trabalho do orquestrador em cima disso** (arquivos que A2 corretamente se recusou a tocar, e
sinalizou nominalmente):

- `CONCERNS.md` → **C-03 marcado RESOLVIDO POR IMPLEMENTAÇÃO**, com as duas mutações coladas e uma
  seção separando o que o gate **não** garante.
- `AGENTS.md:150` → dizia *"`src/types.ts` espelha as structs Rust **à mão**… não há geração"*.
  Virou instrução de regeneração. Sem isso, o arquivo mais lido do repositório mandaria editar à
  mão um arquivo gerado.
- `CONVENTIONS.md:65` → o agente D escreveu *"a migração está em curso"* às ~08:00, o que era
  verdade naquele minuto e deixou de ser antes do fim da run. Atualizado.
- `STATE.md` → todo novo para o `ChatAttachment.status`, que a geração revelou mais largo do que a
  UI trata.

**Não verificado por A2, e ele disse:** o app nunca foi executado — `tsc` aceitar o arquivo e 63
testes de frontend passarem não é a tela; o custo do `ts-rs` no binário de release **não foi
medido** (`cargo build --release` não rodou, e o `design.md` promete esse número).

**Colisão checada:** interseção de escrita vazia. `TESTING.md` é de B2 e está explicitamente
vetado a D; `src/types.ts` é de A2 e está vetado a B2, que foi instruída a não assertar sobre
a forma literal dele. D foi avisada de que a contagem de testes Rust pode subir para ~179
enquanto ela escreve, e mandada datar todo número — o orquestrador remede no fim.

---

## Gates medidos nesta run

Baseline no início da run (medido, não copiado):

- `cargo test --lib`: **177 passando / 0 falhas / 15 ignorados**
- `npm run build`: limpo — 1859 módulos, 5,33 s
- `npm run test:scripts`: **49 passando**

Remedido em 2026-07-28, na retomada, **depois** de remover o `async-trait`:

- `cargo check --lib`: limpo, 4,95 s
- `cargo test --lib`: **177 / 0 / 15** — sem mudança
- `npm test` (**novo gate**, não existia no início da run): **6 arquivos, 52 testes, 3,40 s**

**Fechamento da run**, medido pelo orquestrador depois de A2, B2 e D voltarem:

| Gate | Início da run | Fim da run |
| --- | --- | --- |
| `cargo test --lib` | 177 / 0 / 15 | **181 / 0 / 16** |
| `npm run build` | limpo, 1859 módulos, 5,33 s | limpo, 1859 módulos, **5,37 s** |
| `npm test` | *não existia* | **8 arquivos, 63 testes, 2,89 s** |
| `npm run test:scripts` | 49 | **49**, 119,7 ms |

---

## Working tree no fim da run (2026-07-28)

**45 arquivos modificados, 17 caminhos novos, 10 ícones removidos.** Nada commitado — regra do
`AGENTS.md`. Resumo por origem:

| Origem | O que |
| --- | --- |
| Orquestrador | `STATE.md`, `AGENTS.md`, `CONCERNS.md` (C-01, C-03, C-04), `TESTING.md` (contagem Rust), `CONVENTIONS.md` (uma linha), `.claude/skills/`, `.specs/quick/006`, `.specs/quick/007`, `.specs/runs/`, remoção do `async-trait` |
| Agente C (onda 1) | `README.md` (protoc), 10 ícones removidos |
| Agente A2 | `types_export.rs` (novo), `src/types.ts` (agora gerado), 15 arquivos Rust com `derive(TS)`, `Cargo.toml`/`Cargo.lock`, `.specs/features/generated-types/` |
| Agente B2 | `vitest.config.ts`, `src/test/`, 8 arquivos `.test.ts(x)`, `package.json`/`package-lock.json`, `TESTING.md`, `.specs/features/frontend-testing/` |
| Agente D | `ARCHITECTURE`, `CONVENTIONS`, `INTEGRATIONS`, `STACK`, `STRUCTURE`, `PROJECT.md` |
| **Fora desta run** | `.specs/quick/008-appimage-dangling-llama-launcher/` apareceu às 07:56, antes do primeiro despacho desta sessão, e não foi produzido por nenhum agente daqui. Registrado para não ser atribuído por engano |

---

## Não verificado

Esta seção não é formalidade. As três últimas sessões de UAT acharam defeitos reais que
nenhum gate automatizado pegaria (AD-046, AD-047, AD-050), e o que está abaixo é do mesmo
tipo.

**1. O app nunca foi executado nesta run.** Nem `npm run tauri dev`, nem um build de bundle.
Os três agentes disseram isso por conta própria, e é a limitação mais importante:

- Os **63 testes de frontend** rodam sobre dublês de `invoke`/`listen`. Eles provam a lógica dos
  stores e de dois componentes; **não** provam que a tela de modelos funciona.
- Os **181 testes Rust** incluem o comparador de tipos, que garante `types.ts` ↔ structs. Ele
  **não** garante que a UI trate todos os valores de uma união — o `ChatAttachment.status` é
  o caso concreto, e virou todo.
- A varredura de documentação do agente D é **leitura de código**. Que a sidebar renderize 4
  zonas *visíveis*, que os 39 comandos respondam e que os 8 eventos cheguem à UI não foi
  observado em tela.

**2. Nenhum item de UAT da Fase 2 foi executado**, apesar de a decisão **D1** ter autorizado
dirigir o app contra os dados reais. Os 5 itens (`uat-agent` 7–11) e o item 12 (reimportar
os PDFs, autorizado pela **D2**) continuam abertos. Motivo: as ondas 1 e 2 mexeram em
`src/types.ts`, no `Cargo.toml` e no `package.json` ao mesmo tempo, e dirigir o app sobre
uma árvore em migração produziria resultado não atribuível. **Isto é adiamento, não
conclusão** — a autorização do usuário segue de pé e o trabalho segue por fazer.

**3. Custo do `ts-rs` no binário de release não medido.** `cargo build --release` não rodou.
O `design.md` da `generated-types` promete esse número e ele não existe. Baixo risco — o
`mod types_export` é `#[cfg(test)]`, então o gerador não entra no release — mas os `derive(TS)`
entram, e ninguém pesou.

**4. A remoção dos 10 ícones continua provada só por inspeção de manifesto**, como já estava
registrado na onda 1. `cargo check` não exercita o empacotador. Provar de verdade custa um
`npm run tauri build` (~23 min na AD-045).

**5. O `ROADMAP.md` ficou de fora da varredura de documentação.** O agente D cobriu
`PROJECT.md` e os sete de `codebase/`. Todo aberto no `STATE.md`.

**6. `clippy -D warnings` segue desligado no CI, por decisão medida** (9 warnings triviais,
mas `cargo fmt --check` falha em 30 arquivos / ~1266 linhas). O entregável foi a medição, e
ela não mudou nesta run.

**7. Os 6 itens `human-only` do inventário seguem intocados** — release nova a partir de
`master`, instalação sem admin, update de verdade, rede desligada, AppImage num runner Linux,
assinatura de código. Não há nada que um agente possa fazer neles.

---

## Defeitos da própria skill achados nesta run

A run 001 era também o primeiro teste da `spec-loop`. Quatro defeitos, todos corrigidos:

| # | Defeito | Correção |
| --- | --- | --- |
| 1 | Caminho de i18n errado na tabela de colisão (`src/locales/` em vez de `src/i18n/locales/`) | corrigido no `SKILL.md` |
| 2 | *"O orquestrador edita `.specs/`"* colidia com features novas, que precisam de spec própria | fronteira dividida: projeto é do orquestrador, feature é de quem planeja |
| 3 | A Fase 0 não varria `.specs/codebase/`. Varreu `STATE`/`ROADMAP`/`tasks.md` e achou **5** divergências; quando um agente varreu `codebase/`, achou **24** | aviso explícito no `SKILL.md` |
| 4 | 🔴 Nada proibia escrever o log de execução antes do artefato existir — foi o que produziu o log falso do B | brief do implementador proíbe o ✅ antecipado; brief do validador ganhou o **item 0** (conferir por `ls`/`git status` se os arquivos citados existem, antes de olhar código). Virou a **L-007** |

O defeito 4 é o que vale registrar: a validação adversarial da skill mirava no **código** do
implementador e confiava no **relatório** dele para saber o que validar. O relatório é parte do
trabalho e precisa ser falsificado antes do resto.
