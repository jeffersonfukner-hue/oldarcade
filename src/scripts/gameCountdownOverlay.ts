/** Contrato visual compartilhado da contagem 3–2–1.
 * Durante a contagem só o número permanece visível no overlay; títulos,
 * explicações e botões voltam apenas ao estado normal da partida.
 */
export function setCountdownOverlay(
 overlay:HTMLElement,
 count:HTMLElement,
 action:HTMLElement,
 active:boolean
):void{
 overlay.toggleAttribute('data-countdown-only',active);
 count.hidden=!active;
 action.hidden=active;
}
