# EV Charge Platform

Platforma za rezervacijo električnih polnilnic za poslovne stavbe. Omogoča urejanje in bolj organizirano uporabljanje električnih polnilnic za bodisi službene avtomobile, osebne avtomobile zaposlenih ali kakih gostov.

Osnovna dejavnost platforma je upravljanje rezervacij končih uporabnikov na neke polnilnice.

Osnovni potek je vezan na administratorje.

V nadaljevanju so pomembne definicije, ki gradijo celotno platformo.

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
Kako pa deluje?!?!?!?
























