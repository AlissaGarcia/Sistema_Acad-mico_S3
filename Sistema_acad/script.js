const alunosIniciais = [
    { id: 1, nome: "Aluno 1", notas: ["", "", ""] },
    { id: 2, nome: "Aluno 2", notas: ["", "", ""] },
    { id: 3, nome: "Aluno 3", notas: ["", "", ""] },
    { id: 4, nome: "Aluno 4", notas: ["", "", ""] },
    { id: 5, nome: "Aluno 5", notas: ["", "", ""] },
    { id: 6, nome: "Aluno 6", notas: ["", "", ""] },
    { id: 7, nome: "Aluno 7", notas: ["", "", ""] }
];

let alunos = carregarAlunos();

const listaAlunos = document.getElementById("lista-alunos");
const mensagem = document.getElementById("mensagem");

function carregarAlunos() {
    const dados = localStorage.getItem("notasAcademicas");

    if (dados === null) {
        return alunosIniciais.map(aluno => ({
            ...aluno,
            notas: [...aluno.notas]
        }));
    }

    try {
        const dadosSalvos = JSON.parse(dados);

        if (
            !Array.isArray(dadosSalvos) ||
            dadosSalvos.length !== 7 ||
            dadosSalvos.some(aluno =>
                !Number.isInteger(aluno.id) ||
                typeof aluno.nome !== "string" ||
                !Array.isArray(aluno.notas) ||
                aluno.notas.length !== 3
            )
        ) {
            return alunosIniciais.map(aluno => ({
                ...aluno,
                notas: [...aluno.notas]
            }));
        }

        return dadosSalvos;
    } catch {
        return alunosIniciais.map(aluno => ({
            ...aluno,
            notas: [...aluno.notas]
        }));
    }
}

function calcularMedia(notas) {
    const notasValidas = notas.filter(nota => nota !== "");

    if (notasValidas.length !== 3) {
        return null;
    }

    const soma = notasValidas.reduce(
        (total, nota) => total + Number(nota),
        0
    );

    return soma / 3;
}

function verificarSituacao(media) {
    if (media === null) {
        return "Pendente";
    }

    if (media >= 7) {
        return "Aprovado";
    }

    if (media >= 4) {
        return "Recuperação";
    }

    return "Reprovado";
}

function renderizarAlunos() {
    listaAlunos.innerHTML = "";

    alunos.forEach(aluno => {
        const linha = document.createElement("tr");

        const nome = document.createElement("td");
        nome.textContent = aluno.nome;
        linha.appendChild(nome);

        aluno.notas.forEach((nota, indice) => {
            const celula = document.createElement("td");
            const campo = document.createElement("input");

            campo.type = "number";
            campo.min = "0";
            campo.max = "10";
            campo.step = "0.1";
            campo.value = nota;
            campo.setAttribute(
                "aria-label",
                `Nota ${indice + 1} de ${aluno.nome}`
            );

            campo.addEventListener("change", () => {
                const valor = campo.value.trim();

                if (
                    valor !== "" &&
                    (!Number.isFinite(Number(valor)) ||
                        Number(valor) < 0 ||
                        Number(valor) > 10)
                ) {
                    mensagem.textContent =
                        "Informe uma nota entre 0 e 10.";
                    campo.value = aluno.notas[indice];
                    return;
                }

                aluno.notas[indice] =
                    valor === "" ? "" : Number(valor);

                mensagem.textContent = "";
                renderizarAlunos();
            });

            celula.appendChild(campo);
            linha.appendChild(celula);
        });

        const media = calcularMedia(aluno.notas);
        const celulaMedia = document.createElement("td");

        celulaMedia.textContent =
            media === null ? "--" : media.toFixed(1);

        linha.appendChild(celulaMedia);

        const situacao = verificarSituacao(media);
        const celulaSituacao = document.createElement("td");

        celulaSituacao.textContent = situacao;

        if (situacao === "Aprovado") {
            celulaSituacao.className = "aprovado";
        } else if (situacao === "Recuperação") {
            celulaSituacao.className = "recuperacao";
        } else if (situacao === "Reprovado") {
            celulaSituacao.className = "reprovado";
        }

        linha.appendChild(celulaSituacao);
        listaAlunos.appendChild(linha);
    });

    atualizarResumo();
}

function atualizarResumo() {
    let aprovados = 0;
    let recuperacao = 0;

    alunos.forEach(aluno => {
        const media = calcularMedia(aluno.notas);
        const situacao = verificarSituacao(media);

        if (situacao === "Aprovado") {
            aprovados++;
        }

        if (situacao === "Recuperação") {
            recuperacao++;
        }
    });

    document.getElementById("quantidade").textContent = alunos.length;
    document.getElementById("aprovados").textContent = aprovados;
    document.getElementById("recuperacao").textContent = recuperacao;
}

function salvarNotas() {
    localStorage.setItem("notasAcademicas", JSON.stringify(alunos));
    mensagem.textContent = "Notas salvas com sucesso neste navegador.";
}

function limparNotas() {
    const confirmar = confirm("Deseja apagar todas as notas dos sete alunos?");

    if (!confirmar) {
        return;
    }

    alunos.forEach(aluno => {
        aluno.notas = ["", "", ""];
    });

    localStorage.removeItem("notasAcademicas");
    mensagem.textContent = "Todas as notas foram apagadas.";
    renderizarAlunos();
}

document.getElementById("salvar").addEventListener("click", salvarNotas);
document.getElementById("limpar").addEventListener("click", limparNotas);




renderizarAlunos();
