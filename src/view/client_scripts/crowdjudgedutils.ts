// Some common functions needed on the client side for game states derived from
// the crowdjudgedqtemplate

/**
 * Crowd Judged rounds will (probably all) have to show on the bigscreen:
 * 1) The name of the current active player, so he/she also knows its his/her
 * turn;
 * 2) The list of answers that were already given.
 * 
 * To prevent duplicate code, this handy method helps draw these for us
 * widget script.
 * @param msg The `detail.new_msg` object received within the event listener
 * @param ap_div_id The id of the div to put the name of the active player in
 * @param list_id The `id` attribute of the unordered list to update the
 * contents of
 */
export function crowdJudgedRedraw(msg: any, ap_div_id: string, list_id: string) {
    // Draw the name of the active player:
    if (!msg?.general_info?.active_player)
        return;
    
    const name_elem = document.getElementById(ap_div_id);
    if (!name_elem)
        return;
    
    name_elem.textContent = msg.general_info.active_player;

    
    // Draw the list of given answers:
    if (!msg.general_info?.given_answers)
        return;
    
    const list_elem = document.getElementById(list_id);
    if (!name_elem || !list_elem)
        return;
    
    

    const answers: string[] = msg.general_info.given_answers;
    const clone = list_elem.cloneNode(false);

    for (const answer of answers) {
        const li = document.createElement("li");
        li.textContent = answer;
        clone.appendChild(li);
    }

    list_elem.parentElement?.replaceChild(clone, list_elem);
}