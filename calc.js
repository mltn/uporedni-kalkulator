const defaults = {
    teretZaposlenog: {
      pio: 14,
      zdravstveno: 5.15,
      nezaposlenost: 0.75,
      porez: 10,
    },
    teretPoslodavca: {
      pio: 11,
      zdravstveno: 5.15,
      nezaposlenost: 0,
      porez: 0,
    },
  };
  const getNumberValue = (element) => {
    let val = element.value
      .replace("%", "")
      .replace(".", "")
      .replace(",", ".");
    let num = Number(val);
    return Number.isNaN(num) ? 0 : num;
  };
  const format = (num) => {
    return num
      .toFixed(2)
      .toString()
      .replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  window.addEventListener("DOMContentLoaded", () => {
    const brutoElement = document.getElementById("bruto");
    const radniOdnosElement = document.getElementById("radni-odnos");
    let bruto,
      normiraniTrosak = 50,
      neoporeziviDeo = 32000,
      cenaKnjigovodstva = 5000,
      licniTroskovi = 0;
    (ostaliTroskovi = 5000),
      (pausalKalkulator = 28403),
      (radniOdnos = radniOdnosElement.checked);
    const updateState = () => {
      bruto = getNumberValue(brutoElement);
      radniOdnos = radniOdnosElement.checked;
      brutoElement.value = format(bruto);
      renderAll();
    };

    [brutoElement, radniOdnosElement].forEach((element) => {
      element.addEventListener("change", updateState);
    });
    const createDefaultPidObj = () => ({
      teretZaposlenog: { ...defaults.teretZaposlenog },
      teretPoslodavca: { ...defaults.teretPoslodavca },
      ostaliTroskovi: 0,
      porezNaDohodakGradjana: 0,
    });
    const procenatBruto = (x) => Math.round((x * 10000) / bruto) / 100;
    const renderAll = () => {
      const fizickoLiceElement = document.getElementById("fizicko-lice");
      const fizickoLice = createDefaultPidObj();
      fizickoLice.title = "Fizičko lice";
      fizickoLice.specificnaVrednostZaTipOporezivanja = "Normirani trošak";
      fizickoLice.teretZaposlenog.nezaposlenost = 0;
      fizickoLice.teretZaposlenog.porez = 20;

      const pausalElement = document.getElementById("pausalac");
      const pausal = createDefaultPidObj();
      pausal.specificnaVrednostZaTipOporezivanja = "Kalkulator";
      pausal.title = "Paušalac";
      pausal.editableOsnovica = true;

      const knjigasElement = document.getElementById("knjigas");
      const knjigas = createDefaultPidObj();
      knjigas.title = "Knjigaš";
      knjigas.specificnaVrednostZaTipOporezivanja = "Knjigovođa";
      knjigas.licniTroskovi = 0;
      knjigas.placaPorezNaDohodakGradjana = true;
      knjigas.postojiNeoporeziviDeoNaTeretZaposlenog = true;
      knjigas.neoporeziviDeoNaTeretZaposlenog = 18300;

      render(fizickoLice, fizickoLiceElement);
      render(pausal, pausalElement);
      render(knjigas, knjigasElement);

      let best = [fizickoLice, pausal, knjigas].sort(
        (a, b) => a.ukupnoProcenat - b.ukupnoProcenat
      )[0];
      [fizickoLiceElement, pausalElement, knjigasElement].forEach(
        (element) => {
          if (element.classList.contains("best-option")) {
            element.classList.remove("best-option");
          }
        }
      );
      best.domElement.classList.add("best-option");
    };
    const render = (pidObj, domElement) => {
      if (radniOdnos) {
        pidObj.teretZaposlenog.zdravstveno = 0;
        pidObj.teretZaposlenog.nezaposlenost = 0;
        pidObj.teretPoslodavca.zdravstveno = 0;
      }

      pidObj.domElement = domElement;

      if (pidObj.title === "Fizičko lice") {
        pidObj.osnovica =
            Math.max(0, bruto * normiraniTrosak / 100 - neoporeziviDeo);
      } else if (pidObj.title === "Paušalac") {
        if ((radniOdnos = radniOdnosElement.checked)) {
          pidObj.osnovica = (pausalKalkulator * 100) / 35.5;
        } else {
          pidObj.osnovica = pausalKalkulator / 0.4655;
        }
      } else if (pidObj.title === "Knjigaš") {
        pidObj.ostaliTroskovi = cenaKnjigovodstva;
        pidObj.osnovica = 28402;
      }

      if (pidObj.title === "Knjigaš") {
        pidObj.porezz =
          ((pidObj.osnovica - 18300) * pidObj.teretZaposlenog.porez) / 100;
      } else {
        pidObj.porezz =
          (pidObj.osnovica * pidObj.teretZaposlenog.porez) / 100;
      }

      if (pidObj.postojiNeoporeziviDeoNaTeretZaposlenog) {
        pidObj.teretZaposlenog.ukupno =
          (pidObj.teretZaposlenog.pio * pidObj.osnovica +
            pidObj.teretZaposlenog.zdravstveno * pidObj.osnovica +
            pidObj.teretZaposlenog.porez * (pidObj.osnovica - 18300) +
            pidObj.teretZaposlenog.nezaposlenost * pidObj.osnovica) /
          100;
      } else {
        pidObj.teretZaposlenog.procenatOsnovice =
          pidObj.teretZaposlenog.pio +
          pidObj.teretZaposlenog.zdravstveno +
          pidObj.teretZaposlenog.porez +
          pidObj.teretZaposlenog.nezaposlenost;
        pidObj.teretZaposlenog.ukupno =
          (pidObj.osnovica * pidObj.teretZaposlenog.procenatOsnovice) / 100;
      }
      pidObj.teretPoslodavca.procenatOsnovice =
        pidObj.teretPoslodavca.zdravstveno + pidObj.teretPoslodavca.pio;
      pidObj.teretPoslodavca.ukupno =
        (pidObj.osnovica * pidObj.teretPoslodavca.procenatOsnovice) / 100;

      if (pidObj.placaPorezNaDohodakGradjana) {
        const osnovicaZaPorezNaDohodakGradjana =
          bruto -
          (pidObj.teretZaposlenog.ukupno +
            pidObj.teretPoslodavca.ukupno +
            pidObj.ostaliTroskovi +
            17011 +
            licniTroskovi);
        pidObj.porezNaDohodakGradjana =
          (osnovicaZaPorezNaDohodakGradjana * 10) / 100;
      }

      pidObj.ukupnoPid =
        pidObj.teretZaposlenog.ukupno +
        pidObj.teretPoslodavca.ukupno +
        pidObj.porezNaDohodakGradjana;
      pidObj.neto = bruto - pidObj.ukupnoPid - pidObj.ostaliTroskovi;
      pidObj.ukupnoProcenat = procenatBruto(
        pidObj.ukupnoPid + pidObj.ostaliTroskovi
      );
      domElement.innerHTML =
        `
          <div class="field-block">
              <h3 class="title">${pidObj.title}</h3>
              ` +
        (pidObj.title === "Fizičko lice"
          ? `
              <div class="label-input">
                  <label>
                    <div onmousedown="show()" class="tooltip">
                        <a class="infolink" href="javascript:void(0)"></a>
                        <div id="tooltip" class="tooltiptext">
                        <span class="close" onmouseup="hide()">x</span>
                        <span
                            >Troškovi koji se priznaju bez dokazivanja, definisani su zakonom i
                            zavise od vrste pruženih usluga.</span
                        >
                        </div>
                    </div>
                    Normirani troškovi
                  </label>
                  <input
                    type="text"
                    id="normirani-troskovi" disabled
                    value="${format(normiraniTrosak)}%"
                  />
              </div>
              <div class="label-input">
                  <label>
                    Neoporezivi iznos
                  </label>
                  <input
                    type="text" disabled
                    value="32.000,00"
                  />
              </div>
              `
          : "") +
        (pidObj.title === "Paušalac"
          ? `
              <div class="label-input">
                  <label>
                  <div onmousedown="show2()" class="tooltip">
                      <a class="infolink" href="javascript:void(0)"></a>
                      <div id="tooltip2" class="tooltiptext2">
                      <span class="close" onmouseup="hide2()">x</span>
                      <span
                          >Kliknite na link i unesite tražene podatke kako biste izračunali
                          visinu poreza i doprinosa, a zatim ih unesete ovde
                      </span>
                      </div>
                  </div>

                  <a
                      target="_blank"
                      href="https://eporezi.purs.gov.rs/kalkulator-pausalnog-poreza-i-doprinosa.html"
                  >
                      Kalkulator poreza</a
                  ></label
                  >
                  <input
                  type="text"
                  id="pausal-kalkulator"
                  value="${format(pausalKalkulator)}"
                  />
              </div>
              `
          : "") +
        (pidObj.title === "Knjigaš"
          ? `
              <div class="label-input">
                  <label>
                  <div onmousedown="show3()" class="tooltip">
                      <a class="infolink" href="javascript:void(0)"></a>
                      <div id="tooltip3" class="tooltiptext3">
                      <span class="close" onmouseup="hide3()">x</span>
                      <span
                          >Ako poslujete kao knjigaš neophodan vam je knjigovođa. Unesite cenu
                          knjigovodstva kako biste dobili precizniji obračun.
                      </span>
                      </div>
                  </div>

                  Cena knjigovodstva</label
                  >
                  <input
                  type="text"
                  id="cena-knjigovodstva"
                  value="${format(cenaKnjigovodstva)}"
                  />
              </div>
              <div class="label-input">
                  <label>
                  <div onmousedown="show4()" class="tooltip">
                      <a class="infolink" href="javascript:void(0)"></a>
                      <div id="tooltip4" class="tooltiptext4">
                      <span class="close" onmouseup="hide4()">x</span>
                      <span
                          >Računi koje platite za troškove poslovanja (npr. telefon, struja,
                          internet...) sa preduzetničkog računa smanjiće osnovicu za obračun
                          poreza na dohodak.
                      </span>
                      </div>
                  </div>

                  Lični troškovi</label
                  >
                  <input type="text" id="licni-troskovi" value="${format(licniTroskovi)}" />
              </div>
              `
          : "") +
        `
                <div class="label-input">
                    <label>Osnovica</label>
                    <input
                    type="text"
                    class="osnovica"
                    value="${format(pidObj.osnovica)}"
                    disabled
                    />
                </div>
              </div>
              <div
              class="sakrivalica ${document.getElementById("myCheck").checked ? "show" : "hide"}"
              >
              <div class="field-block">
                  <h4>Na teret zaposlenog</h4>
                  <div class="label-input">
                  <label>PIO (${format(pidObj.teretZaposlenog.pio)}%)</label>
                  <input
                      type="text"
                      class="zaposleni-pio"
                      disabled
                      value="${format((pidObj.osnovica * pidObj.teretZaposlenog.pio) / 100)}"
                  />
                  </div>
                  <div class="label-input">
                  <label
                      >Zdravstveno (${format(pidObj.teretZaposlenog.zdravstveno)}%)</label
                  >
                  <input
                      type="text"
                      class="zaposleni-zdravstveno"
                      disabled
                      value="${format((pidObj.osnovica * pidObj.teretZaposlenog.zdravstveno) / 100)}"
                  />
                  </div>
                  <div class="label-input">
                  <label>Porez (${format(pidObj.teretZaposlenog.porez)}%)</label>
                  <input type="text" disabled value="${format(pidObj.porezz)}" />
                  </div>
                  <div class="label-input">
                  <label
                      >Nezaposlenost (${format(pidObj.teretZaposlenog.nezaposlenost)}%)</label
                  >
                  <input
                      type="text"
                      class="zaposleni-nezaposlentost"
                      disabled
                      value="${format(
            (pidObj.osnovica * pidObj.teretZaposlenog.nezaposlenost) / 100
          )}"
                  />
                  </div>
                  <div class="label-input">
                  <label><b>Ukupno</b></label>
                  <input
                      type="text"
                      value="${format(pidObj.teretZaposlenog.ukupno)}"
                      disabled
                  />
                  </div>
                  <div class="label-input">
                  <label><b>%</b></label>
                  <input
                      type="text"
                      value="${format(procenatBruto(pidObj.teretZaposlenog.ukupno))}%"
                      disabled
                  />
                  </div>
              </div>
              <div class="field-block">
                  <h4>Na teret poslodavca</h4>
                  <div class="label-input">
                  <label>PIO (${format(pidObj.teretPoslodavca.pio)}%)</label>
                  <input
                      type="text"
                      value="${format((pidObj.osnovica * pidObj.teretPoslodavca.pio) / 100)}"
                      disabled
                  />
                  </div>
                  <div class="label-input">
                  <label
                      >Zdravstveno (${format(pidObj.teretPoslodavca.zdravstveno)}%)</label
                  >
                  <input
                      type="text"
                      value="${format((pidObj.osnovica * pidObj.teretPoslodavca.zdravstveno) / 100)}"
                      disabled
                  />
                  </div>
                  <div class="label-input">
                  <label><b>Ukupno</b></label>
                  <input
                      type="text"
                      value="${format(pidObj.teretPoslodavca.ukupno)}"
                      disabled
                  />
                  </div>
                  <div class="label-input">
                  <label><b>%</b></label>
                  <input
                      type="text"
                      value="${format(procenatBruto(pidObj.teretPoslodavca.ukupno))}%"
                      disabled
                  />
                  </div>
              </div>
              <div class="field-block">
                  <h4>Porez na dohodak građana</h4>
                  <div class="label-input">
                  <label>Porez na doh</label>
                  <input
                      type="text"
                      value="${format(pidObj.porezNaDohodakGradjana)}"
                      disabled
                  />
                  </div>
              </div>
              </div>
              <div class="field-block total-block">
              <h3>Ukupno</h3>
              <div class="label-input">
                  <label><b>Ostali troškovi</b></label>
                  <input type="text" value="${format(pidObj.ostaliTroskovi)}" disabled />
              </div>
              <div class="label-input">
                  <label><b>UKUPNO PID</b></label>
                  <input type="text" value="${format(pidObj.ukupnoPid)}" disabled />
              </div>
              <div class="label-input">
                  <label><b>NETO</b></label>
                  <input type="text" value="${format(pidObj.neto)}" disabled />
              </div>
              <div class="label-input total-percentage-container">
                  <label class="total-percentage"
                  ><b>TROŠKOVI POSLOVANJA:</b>
                  <h2>${format(pidObj.ukupnoProcenat)}%</h2></label
                  >
              </div>
              </div>
`;

      if (pidObj.title === "Fizičko lice") {
        let normiraniTrosakElement =
          document.getElementById("normirani-troskovi");
        normiraniTrosakElement.addEventListener("change", () => {
          normiraniTrosak = getNumberValue(normiraniTrosakElement);
          render(pidObj, domElement);
        });
      } else if (pidObj.title === "Paušalac") {
        let pausalKalkulatorElement =
          document.getElementById("pausal-kalkulator");
        pausalKalkulatorElement.addEventListener("change", () => {
          pausalKalkulator = getNumberValue(pausalKalkulatorElement);
          render(pidObj, domElement);
        });
      } else if (pidObj.title === "Knjigaš") {
        let cenaKnjigovodstvaElement =
          document.getElementById("cena-knjigovodstva");
        cenaKnjigovodstvaElement.addEventListener("change", () => {
          cenaKnjigovodstva = getNumberValue(cenaKnjigovodstvaElement);
          render(pidObj, domElement);
        });
        let licniTroskoviElement = document.getElementById("licni-troskovi");
        licniTroskoviElement.addEventListener("change", () => {
          licniTroskovi = getNumberValue(licniTroskoviElement);
          render(pidObj, domElement);
        });
      }
    };
    updateState();
  });
