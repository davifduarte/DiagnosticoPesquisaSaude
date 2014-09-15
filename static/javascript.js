var field_problem_list = []; // lista de campos com problema
var fields_register = {}; // dicionario de registros por campo
var list_uf_field = [];
var list_ano_field = [];

function loadfile() {

    $("#filename").change(function(e) {
        if ( !$(this).val() ) {return false;}
        $("#result").empty();
        $("#spinner").show();
        field_problem_list = [];
        fields_register = {};
        list_uf_field = [];
        list_ano_field = [];

        $("#filename").parse({
            // http://papaparse.com/docs.html#jquery
            config: {
                // worker: true,
                encoding: "ISO-8859-1",
                complete: function(results) {
                print_label(results.data);
                }
            }
        });
    });
}

function evento_click() {
    $(".list_register_open").click(function (event) {
        load_projetos($(this).attr('field'), "#list_register");
        event.preventDefault();
    });
    $("#select1").change(function () {
        load_projetos($("#select1").val(), '#result');
    });
    $("#select2").change(function () {
        load_projetos($("#select1").val(), '#result');
    });
    $("#select3").change(function () {
        load_projetos($("#select1").val(), '#result');
    });
}

function load_projetos(field, target) {
    $(target).empty();
    var uf = $("#select2").val();
    var ano = $("#select3").val();
    var result_content = '';
    var qut_result = 0;
    var list_projects = [];
    if (field == 'todos') {
        for (n=0; n<field_problem_list.length; n++) {
            var _field = field_problem_list[n].field;
            var list_register = fields_register[_field];
            load_result_content(list_register);
        }
    }
    else {
        var list_register = fields_register[field];
        if ( !list_register ) {
            $(target).append("<hr />Não há registros em branco para este campo.");
            return false;
        }
        load_result_content(list_register)
    }

    function load_result_content (list_register) {
        for (k=0; k<list_register.length; k++) {
            var filter_uf = false;
            var filter_ano = false;
            if ( uf == list_register[k].uf) { filter_uf = true; };
            if ( ano == list_register[k].ano) { filter_ano = true; };
            if (uf == 'todos') { filter_uf = true; };
            if (ano == 'todos') { filter_ano = true; };
            if ( filter_uf && filter_ano) {
                item = list_register[k];
                if ( list_projects.indexOf(item.id) == -1 ) {
                    result_content = result_content + "<tr><td>" + item.id + "</td><td><a target='_blank' href='http://aplicacao.saude.gov.br/pesquisasaude/visao/lermais/lermaispage.html?idPesquisa="+ item.id + "'>" + item.title + "</a></td></tr>";
                    qut_result = qut_result + 1;
                    list_projects.push(item.id);
                } 
            }
        }
    }

    if ( target == '#result') {
        if ( qut_result > 1)
            var result = "<hr /><h3>Campos sem registros</h3>" + qut_result + " registros encontrados<br /><table class='listing' cellspacing='0'><tr><th width='15%'>Código da Pesquisa</th><th>Título do Projeto</th></tr>";
        else
            var result = "<hr /><h3>Campos sem registros</h3>" + qut_result + " registro encontrado<br /><table class='listing' cellspacing='0'><tr><th width='15%'>Código da Pesquisa</th><th>Título do Projeto</th></tr>";
    }
    else {
        var result = "<div class='list_register_close'></div><table class='listing' cellspacing='0'><tr><th width='15%'>Código da Pesquisa</th><th>Título do Projeto</th></tr>";
    }
    result = result + result_content;
    result = result + "</table>";

    $(target).empty();
    $(target).append(result);
}

$(document).ready(function () {
    loadfile();
    evento_click();
    $('#list_register').popup();
    $("#filter").hide();
});

function print_label(arr) {
    var result = "<table class='listing' cellspacing='0'><tr><th>Nome do campo</th><th>Qut.</th><th>%</th></tr>", result_problem = "<ul>", select = "";
    var list_label_field = []
    select1 = ''
    for (var j=0; j<arr[0].length; j++) {
        count_blank(j, arr);
        list_label_field.push(arr[0][j])
    }

    list_label_field.sort();
    select1 = select1 + "<option value='todos'>Todos</option>";
    for (var h=0; h<list_label_field.length; h++) { 
        select1 = select1 + "<option value='" + list_label_field[h] + "''>" + list_label_field[h] + "</option>";
    }
    
    field_problem_list.sort(function(a, b){return b.qut - a.qut})
    for (var z=0; z<field_problem_list.length; z++) {
        var item = field_problem_list[z];
        result = result + "<tr><td><a href='' class='list_register_open' field='" + item.field + "'>" + item.field + "</a></td><td>" + item.qut + "</td><td>"+ item.perc.toFixed(2) + "%</td></tr>";
    }
    $("#spinner").hide();
    $("#filter").show();
    result = result + "</table>";
    $("#select1").empty();
    $("#select1").append(select1);
    $("#result").append("<hr /><h3>Campos sem registros</h3>Total de registros analisados: " + (arr.length-1)+ "<br />");
    $("#result").append(result);
    load_uf_ano();
    evento_click();
}

function count_blank(index, arr) {
    var blank = 0
    for (var i=1; i<arr.length-1; i++) {
        var item = arr[i][index];
        if (item == "---" || item == "") {
            if ( !fields_register[arr[0][index]] ) {
                fields_register[arr[0][index]] = []
            }
            item_register = {'id' : arr[i][0], 'title': arr[i][5], 'uf': arr[i][2], 'ano': arr[i][4]};
            fields_register[arr[0][index]].push(item_register);
            blank = blank + 1;
        }
        if ( list_uf_field.indexOf(arr[i][2]) == -1 ) {
            list_uf_field.push(arr[i][2])
        } 
        if ( list_ano_field.indexOf(arr[i][4]) == -1 ) {
            list_ano_field.push(arr[i][4])
        }
    }
    if ( blank != 0 ) {
        item_problem = {'qut': blank, 'perc': ((blank/(arr.length-1))*100), 'field': arr[0][index]};
        field_problem_list.push(item_problem);
    }
    return false;
}

function load_uf_ano() {
    list_uf_field.sort();
    list_ano_field.sort();
    select2 = '';
    select3 = '';
    select2 = select2 + "<option value='todos'>Todos</option>";
    select3 = select3 + "<option value='todos'>Todos</option>";
    for (var h=0; h<list_uf_field.length; h++) {
        select2 = select2 + "<option value='" + list_uf_field[h] + "''>" + list_uf_field[h] + "</option>";
    }
    for (var h=0; h<list_ano_field.length; h++) {
        select3 = select3 + "<option value='" + list_ano_field[h] + "''>" + list_ano_field[h] + "</option>";
    }
    $("#select2").empty();
    $("#select3").empty();
    $("#select2").append(select2);
    $("#select3").append(select3);
}