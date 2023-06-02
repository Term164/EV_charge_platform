# EV Charge Platform

Platforma za rezervacijo električnih polnilnic za poslovne stavbe. Omogoča urejanje in bolj organizirano uporabljanje električnih polnilnic za bodisi službene avtomobile, osebne avtomobile zaposlenih ali kakih gostov.

Osnovna dejavnost platforma je upravljanje rezervacij končih uporabnikov na neke polnilnice.

Osnovni potek je vezan na administratorje.

V nadaljevanju so pomembne definicije, ki gradijo celotno platformo.

# KONCEPTUALNI NIVO

### Polnilnica
Polnilnica je lahko navadna ali pametna (vsebuje protokole za komunikacijo). Polnilnice pripadajo neki stavbi/zgradbi. Polnilnice lahko uporabljajo vsi, ki so registrirani v stavbi, razen če polnilnice pripadajo določenemu podjetju v teji stavbi - te lahko uporabljajo le zaposleni tega podjetja.

### Podjetje
Podjetje ima (enega ali več) administratorja podjetja, ki dodaja (in ureja) svoje zaposlene kot končne uporabnike platforme. Če podjetje posluje v več stavbah, je administratorju omogočeno dodeljevanje zaposlenega v določene stavbe podjetja - ali pa pusti prosto, kar pomeni da nek zaposlen v podjetju lahko uporablja vse polnilnice vseh stavb podjetja.

Podjetje ima lahko svojo stavbo ali pa najema. V tem smislu se razlikuje le "vloga za platformo". Če ima podjetje svojo stavbo, bo imelo svojega Administratorja podjetja in bo lahko urejalo svoje polnilnice. Več o administratorjih kasneje.

### Stavba
Stavba je objekt, na katero so vezane polnilnice. V stavbi je lahko eno ali več podjetij. Stavba ima (enega ali več) Administratorja stavbe, kateri lahko doda podjetje v stavbo (tako omogoči novemu podjetju uporabo polnilnic). Predvsem pa dodaja in ureja polnilnice. Polnilnice so lahko v skupno uporabo, ali pa pripadajo določenemu podjetju v stavbi.

<br>
To so bile osnovni izrazi, ki se uporabljajo.

## ADMINISTRATORJI

Diagram primerov uporabe za okviren visokonivojski načrt.

![](/Use_case_diagram.png)

### Administrator Platforme
Plaftorm admin bo nek zaposlen v tem podjetju (EV charge)(TBD), kateri služi kot avtentikator in vrhovni administrator. Ko želi podjetje uporabljati platformo, pošlje vlogo in Admin platforme ustvari novo podjetje v bazi ter temu podjetju dodeli Admina podjetja.

Admin platforme tudi doda stavbo (tudi prek vloge) v bazo ter dodeli Administratorja stavbe.

Dejanski primeri uporabe:
1) Ustvarjanje podjetja
>V bazo se doda to podjetje. Spisek podjetij se sklicuje na to.
>> Npr. ko se dodaja podjetje v stavbo
2) Dodajanje administratorja podjetja
> Zapiše se kdo so admini ter se tem uporabnikom dodeli pravice.
3) Ustvarjanje stavbe
> V bazo se doda stavbo. Na to se sklicuje spisek stavb.
4) Dodajanje administratorja stavbe
> Zapiše se kdo so admini ter se tem uporabnikom dodeli pravice
5) Splošno urejanje
> Admin platforme lahko pregleduje, dodaja/ureja/briše vse stavbe, podjetja in končne uporabnike.

### Administrator Stavbe
Administrator stavbe skrbi za polnilnice in podjetja v stavbi. Če je podjetje lastnik stavbe, je Admin stavbe po navadi kar Admin podjetja.

Primeri uporabe:
1) Dodajanje podjetja v stavbo
> Podjetje logično posluje v teji stavbi in lahko uporablja polnilnice.
2) Dodajanje in urejanje polnilnic.
> Če stavba dobi nove polnilnice (ali izgubi kakšne), lahko Admin stavbe to uredi.
>> Ob prvem ustvarjanju stavbe se lahko že tam pove, koliko polnilnic ima, za to pa poskrbi Admin platforme.
3) Dodeljevanje polnilnic podjetju
> Če so neke polnilnice od podjetja, se lahko to zabeleži, te polnilnice bodo nato na voljo le zaposlenim tega podjetja.
Če so polnilnice proste (od stavbe), bodo na voljo vsem uporabnikom v stavbi.

### Administrator Podjetja
Admin podjetja vpisuje svoje zaposlene kot končne uporabnike, tako jim omogoči uporabo platforme.

Primeri uporabe:
1) Dodajanje končnih uporabnikov v podjetje
> Zaposleni lahko sedaj uporablja platformo. Podrobnejša razlaga "dodajanja končnega uporabnika" bo v drugem dokumentu.
2) Dodeljevanje zaposlenega v določene stavbe
> Če podjetje posluje v več stavbah, lahko Admin podjetja ureja zaposlene, da dostopajo le do določenih polnilnic stavb. Drugače lahko zaposlen uporablja vse polnilnice v vseh stavbah tega podjetja.

## VLOGA
To je nekak visok okviren flow k pristopu uporabe te platforme.
>Ko podjetje želi uporabljati platformo, odda vlogo (ali pa kako drugače, pomembna je avtentikacija). Admin platforme registrira podjetje in ustvari Admina podjetja (ter dodeli).

>Če ima podjetje svojo stavbo, lahko ob vlogi tudi poda vlogo za stavbo, kjer bo Admin platforme poleg podjetja dodal tudi stavbo ter ustvaril Admina stavbe (ter dodeli). Ob ustvarjanju stavbe se lahko že pove število polnilnic, ali pa jih Admin stavbe naknadno doda.


## KONČNI UPORABNIK
Končni uporabnik lahko uporablja platformo za rezerviranje njemu dostopnih polnilnic.
Končni uporabnik bo zaposlen v nekem podjetju.

Ker je sistem rezervacij kompleksen, ima rezervacija svoje poglavje.

Primeri uporabe:
1) Pregled nad dostopnimi polnilnicami
> Končni uporabnik ima pregled nad polnilnicami, ki so njemu dostopne. To pomeni polnilnice v stavbah, kjer podjetje posluje, ali pa kakšne prosto dostopne polnilnice.
>>Tu lahko tudi vidi koliko uporabnikov trenutno čaka na neke polnilnice
2) Rezervacija poljubne polnilnice v časovnem razponu
> Ko uporabnik želi polniti, lahko izbere nek časovni razpon in se rezervira. Načeloma se rezervira na vse polnilnice v neki stavbi. 
>>Izbere lahko časovni razpon, tu lahko nemudoma dobi rezervacijo, če je neka polnilnica prosta, ali pa se postavi v vrsto ter dobi obvestila, če se polnilnice sprostijo.
3) Rezervacija določenega tipa polnilnice
> Podobno kot prejšni primer, vendar tu je omogočena rezervacija na točno določen tip polnilnice.
>>Npr. uporabnik potrebuje super hitro polnilnico, ali pa avto podpira točno nekaj
4) Pregled in urejanje rezervacij
> Uporabnik lahko pregleduje svoje rezervacije ter jih ureja. 
>> Spreminja časovni razpon, spreminja tip, ...
6) Preklic rezervacije
> Uporabnik prekliče rezervacijo, s tem se odstrani iz vrste  in se vrsta popravi (drugi dobijo obvestila)

## REZERVACIJA
Rezervacija je jedro platforme.
Ko končni uporabnik želi uporabljati polnilnice, bo na platformi izbral željeni čas polnjenja.
Ta bo omejen z obeh strani.
> Trenutno se govori za minimum 30 minut in maksimum 3 ure.

Nato bo še izbral dostopni čas, torej od kdaj do kdaj je na voljo in želi polniti.
> Če so polnilnice proste, mu bo ena dodeljena, drugače se postavi v čakalno vrsto. Če nekdo drug prekine rezervacijo ali nekdo zaključi prej, se čakalna premakne.

Uporabnik lahko tudi poleg rezervacije ure (zgoraj omenjeno) izbere tudi tip polnilnice, nakar bo logika platforme poskrbela, da dobi izbran tip.
Če ima uporabnik izbrane 3 ure in dobi 2 uri, je še vedno 1 ura v rezervaciji.

# TEHNIČNI NIVO
Tehnični nivo vsebuje tehnične detajle in izraze, zato bo jezik bolj tehnični (ne književni).

ER diagram, trenutna verzija (morda se spremeni, oz. *dopolni* ).
Baza bo PostgreSQL.
Ta slika je malce outdated (dodali smo še eno tabelo in še en stolpec). Sigruno lahko kje online pretvorimo SQL kodo v ER diagram.

![](/ER_diagram.png)

Nekaj o rezervacijah:
Tehnično je implentirana kot tabela v bazi, katera se filtrira in sortira, tako se obnaša kot vrsta.
Sortira se po `creation_time`. Pogojuje se po `allocated_from`, `allocated_to`, `charging_time`, po tem se loči rezervacije, ki so že v izvajanju ali ne.

Link do začasne baze: [NeonDB](https://console.neon.tech/app/projects) (personal)

Še kaj o podatkovni bazi?

<br>

# API
Base URL: domain.com/api/v1 (swagger)

Endpointi sledijo principu: api/version/group/method/methodName

V oklepajih so parametri, vprašaj pomeni "nullable", torej optional parameter. Pri vseh pride zraven še secret/token/sessionID. 

Vsakič, ko se izvede klic na endpoint, se v backendu najprej izvede *confirmation* funkcija, ki primerja podan secret/token/sessionID, torej če je potekel (če ni ga osveži), in pa če ima dovoljene pravice za to akcijo (role). Če confirmation vrne *true* se nadaljuje koda, torej klic na dejansko funkcijo, drugače vrne response *401 unathorized*.

Pri vsaki je treba še jasno definirati, kdo lahko dostopa do te metode - katere role so avtorizirane!

Grupe:

<br>

## AUTH: /api/v1/auth
Metode namenjene avtentikaciji in avtorizaciji. Potrebno je še bolj naštudirati oath 2.0 ali pa lepo dodelati naš prvotni plan.

`/api/v1/auth/login`<br>
Uporabnik se prijavi, ob tem poda svoj email in geslo, če je uspešno, dobi nazaj generiran secret/token/sessionID

`/api/v1/auth/register/step1`<br>
Uporabnik se registrira tako, da poda svoj email in geslo. Registracijo mora še potrditi

`/api/v1/auth/register/step2`<br>
Registracija se potrdi v drugem koraku, ko uporabnik "pride" na ta url, poslan prek maila

`/api/v1/auth/logout`<br>
Uporabnik se odjavi, pri tem se zbriše secret/token/sessionID

<br>

## USER: /api/v1/user
Metode namenjene urejanju uporabnikov. *Ustvari se nov nekaj* pomeni le, da se obstoječemu profilu - ki je vedno že registriran po navadnem načinu (auth/register) - doda te pravice.

`/api/v1/user/post/assignBadmin (userID, buildingID)`<br>
Ustvari se nov admin stavbe

`/api/v1/user/post/assignCadmin (userID, companyID)`<br>
Ustvari se nov admin podjetja

`/api/v1/user/post/assignCompany (userID, companyID)`<br>
 Ustvari zaposlenega

`/api/v1/user/post/assignBuilding (userID, buildingID)`<br>
Zaposlenega se doda v neko stavbo, v kateri operira podjetje

`/api/v1/user/get/buildingAdmins`<br>
Vsi admini stavb

`/api/v1/user/get/companyAdmins`<br>
Vsi admin podjetij

`/api/v1/user/get/assignedBadmins (buildingID)`<br>
Vsi admini stavb določene stavbe

`/api/v1/user/get/assignedCadmins (companyID)`<br>
Vsi admini podjetij določenega podjetja

`/api/v1/user/delete/employee (userID, companyID?, buildingID?)`<br>
Izbris uporabnika, največkrat zaposlenega (če podan companyID), lahko tudi le izbris zaposlenega iz neke stavbe od podjetja, lahko splošen izbris uporabnika

`/api/v1/user/delete/badmin (userID)`<br>
Odstranitev pravice adminu stavbe

`/api/v1/user/delete/cadmin (userID)`<br>
Odstranitev pravice adminu podjetja

`/api/v1/user/patch/editProfile (userID)`<br>
Urejanje svojega profila - navaden uporabnik, admini nimajo kaj

<br>

## COMPANY: /api/v1/company
Metode namenjene urejanju podjetij.

`/api/v1/company/post/new`<br>
Ustvarjanje novega podjetja

`/api/v1/company/get/all`<br>
Izpis vsej podjetij

`/api/v1/company/patch/edit`<br>
Urejanje podjetja

`/api/v1/company/delete/company (companyID)`<br>
Odstrani podjetje

<br>

## BUILDING: /api/v1/building
Metode, ki vračajo stavbe.

`/api/v1/building/get/all`<br>
Izpis vseh stavb

`/api/v1/building/get/companyOwned (companyID)`<br>
Vse stavbe, v katerih operira dano podjetje

`/api/v1/building/post/new`<br>
Ustvarjanje nove stavbe

`/api/v1/building/patch/edit`<br>
Urejanje stavbe

`/api/v1/building/delete/building`<br>
Odstranjevanje stavbe

`/api/v1/building/post/assignCompany (buildingID)`<br>
Dodajanje podjetja v stavbo

`/api/v1/building/get/assignedCompanies (buildingID)`<br>
Podjetja, ki operirajo v dani stavbi

<br>

## STATION: /api/v1/station
Metode za električne polnilne postaje.

`/api/v1/station/post/new (buildingID)`<br>
Dodajanje polnilnice ter kateri stavbi pripada

`/api/v1/station/patch/edit (stationID)`<br>
Urejanje polnilnice

`/api/v1/station/get/all (buildingID?)`<br>
Izpis vseh polnilnic, oz. pogosteje vseh polnilnic v neki stavbi

`/api/v1/station/get/allAvailable (userID)`<br>
Izpis vsej polnilnic, ki so dostopne danemu uporabniku (torej upošteva stavbe in podjetja)

`/api/v1/station/post/assignCompany (stationID, companyID)`<br>
Rezervira polnilnico nekemu podjetju

`/api/v1/station/delete/station (stationID)`<br>
Odstrani polnilnico

<br>

## RESERVATION: /api/v1/reservation
Metode namenjene logiki z rezervacijami

`/api/v1/reservation/get/all (userID)`<br>
Izpis vseh rezervacij danega uporabnika

`/api/v1/reservation/patch/edit (reservationID)`<br>
Urejanje rezervacije

`/api/v1/reservation/delete/cancel (reservationID)`<br>
Preklic rezervacije

`/api/v1/reservation/post/new (…)`<br>
Ustvarjanje rezervacije - tu pride ogromno parametrov, od stavbe, posebnega tipa, podjetja, ...

`/api/v1/reservation/get/stationType (buildingID)`<br>
Posebna pomožna metoda, izpis vseh tipov polnilnic pri stavbi









