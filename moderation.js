const filter_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:oyF_ptYd/filter";

export async function filter(text) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
            "text": text,
        })
    }

    try {
        const response = await fetch(filter_api_url, requestOptions);
        const result = await response.text();

        var result_parse = JSON.parse(result);
        var response_result = result_parse.response.result;
        var result_response = response_result.response;

        if (result_response.categories) {
            for (let i = 0; i < result_response.categories.length; i++) {
                const category = result_response.categories[i];
                const label = category.label;
                const label_topic = label.substring(0, label.indexOf(">"));
                const label_reason = label.substring(label.indexOf(">") + 1);

                if (label_topic == "Sensitive Topics") {
                    return label_reason;
                }
            }
        }

        return "No reason";
    } catch (error) {
        console.warn("There was an error trying to fetch text filter: " , error);
        return "No reason";
    }
}