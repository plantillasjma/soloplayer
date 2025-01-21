// Definición de la clase myPlayerClass 
class myPlayerClass {
    // Constructor que recibe los datos del reproductor, los idiomas y los cyberlockers
    constructor(playerData, langs, cyberlockers) {
        this.playerData = playerData;  // Datos del reproductor
        this.langs = langs;            // Configuración de idiomas
        this.cyberlockers = cyberlockers;  // Configuración de cyberlockers
        this.processFinalPlayer();  // Llama al método que procesa el reproductor final
    }

    // Obtiene la configuración de un idioma específico
    getLangConfig(langName, property = null) {
        return this.getObjectConfig(this.langs, langName, property);
    }

    // Obtiene la configuración de un cyberlocker específico
    getCyberlockersConfig(cyberlockerName, property = null) {
        return this.getObjectConfig(this.cyberlockers, cyberlockerName, property);
    }

    // Obtiene la configuración de un objeto (idioma o cyberlocker) por nombre
    getObjectConfig(configArray, name, property = null) {
        let config = configArray.find(config => config.name == name);  // Busca la configuración por nombre
        if (!config) config = configArray.find(config => config.default === true);  // Usa la configuración por defecto si no se encuentra
        if (!config) throw Error("Bad Config");  // Lanza un error si no se encuentra ninguna configuración
        return property ? config[property] : config;  // Devuelve la configuración completa o solo una propiedad
    }

    // Ordena los idiomas según la propiedad de prioridad
    orderLangs() {
        this.langs = this.langs.sort(this.orderByPriorityProperty);
    }

    // Compara dos objetos según su prioridad
    orderByPriorityProperty(a, b) {
        let priorityA = a.priority;
        let priorityB = b.priority;
        return priorityA === priorityB ? 0 : (priorityA > priorityB ? 1 : -1);
    }

    // Remueve los cyberlockers cuya propiedad "display" es falsa
    removerDisplayFalseCyberlockers(data) {
        return data.filter(item => this.getCyberlockersConfig(item.cyberlocker, "display") === true);
    }

    // Agrupa los datos del reproductor por los idiomas visibles
    groupByVisibleLangs(data) {
        let grouped = {};
        this.langs.forEach(lang => {
            if (lang.display === true) {
                grouped[lang.name] = [];  // Crea una entrada en el grupo para cada idioma visible
            }
        });
        data.forEach(item => {
            if (grouped[item.language]) {
                grouped[item.language].push(item);  // Añade los datos al grupo correspondiente por idioma
            }
        });
        return grouped;
    }

    // Ordena los datos del reproductor según la prioridad de los cyberlockers
    orderPlayer(groupedData) {
        for (let lang in groupedData) {
            if (groupedData[lang].length === 0) {
                delete groupedData[lang];  // Elimina el idioma si no tiene datos
                continue;
            }
            groupedData[lang] = groupedData[lang].sort((a, b) => {
                let priorityA = this.getCyberlockersConfig(a.cyberlocker, "priority");
                let priorityB = this.getCyberlockersConfig(b.cyberlocker, "priority");
                return priorityA === priorityB ? 0 : (priorityA > priorityB ? 1 : -1);
            });
        }
        return groupedData;
    }

    // Procesa el reproductor final aplicando todas las transformaciones
    processFinalPlayer() {
        this.orderLangs();  // Ordena los idiomas
        let filteredData = this.removerDisplayFalseCyberlockers(this.playerData);  // Filtra los cyberlockers no visibles
        filteredData = this.groupByVisibleLangs(filteredData);  // Agrupa los datos por idioma visible
        this.finalPlayer = this.orderPlayer(filteredData);  // Ordena el reproductor final
    }

    // Devuelve el reproductor final procesado
    getFinalPlayer() {
        return this.finalPlayer;
    }
}

// Función que obtiene parámetros de la URL
function getQueryStringParameter(param) {
    return new URLSearchParams(window.location.search).get(param);
}

// Crea una instancia de myPlayerClass con los datos necesarios
var myPlayer = new myPlayerClass(player, langs, cyberlockers);
var playerData = myPlayer.finalPlayer;
var player_base_url = "";

// Al cargar el documento, se inicializan los elementos del reproductor
$(document).ready(function () {
    // Función que genera el reproductor basado en los datos procesados
    (function generatePlayerUI(playerData) {
        // Recorre los idiomas disponibles
        Object.keys(playerData).forEach(lang => {
            let langIcon = myPlayer.getLangConfig(lang, "icon");  // Obtiene el ícono del idioma
            $(".langclass").append(
                '<li id="li-' + lang + '" onclick="SelLang(this, \'' + lang + '\');">' +
                '<img src="https://cdn.jsdelivr.net/gh/plantillasjma/soloplayer@main/Server/' + langIcon + '">' +
                '</li>'
            );
            $(".cyberlockerClass").append('<div class="OD OD_' + lang + '"></div>');
            // Recorre los cyberlockers disponibles para cada idioma
            playerData[lang].forEach(item => {
                let cyberlockerIcon = myPlayer.getCyberlockersConfig(item.cyberlocker, "icon");
                $(".OD_" + lang).append(
                    "<li onclick=\"go_to_player('" + item.link + "')\">" +
                    '<img src="https://cdn.jsdelivr.net/gh/plantillasjma/soloplayer@main/Server/' + cyberlockerIcon + '">' +
                    '<span>' + item.cyberlocker + '</span>' +
                    '<p>Audio: ' + item.language + ' - Calidad: ' + item.quality + '</p>' +
                    '</li>'
                );
            });
        });
    })(playerData);

    // Establece el primer idioma y cyberlocker como seleccionados por defecto
    $(".langclass li:first").addClass("SLD_A");
    $(".cyberlockerClass div:first").addClass("REactiv");

    // Cambia de idioma si hay un idioma seleccionado en la URL
    (function selectLangFromURL() {
        let selectedLang = getQueryStringParameter("selectedLang");
        if (["Ingles", "Español-Latino", "Español", "Japones", "Koreano", "Frances", "Portugues", "Argentino", "Colombiano", "Peruano", "Brasileño"].includes(selectedLang)) {
            $(".SelectLangDisp li").removeClass("SLD_A");
            $("#li-" + selectedLang).addClass("SLD_A");
            $(".cyberlockerClass div").removeClass("REactiv");
            $(".cyberlockerClass .OD_" + selectedLang).addClass("REactiv");
        }
    })();
});
