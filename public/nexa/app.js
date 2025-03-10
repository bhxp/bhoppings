const API_URL = "https://text.pollinations.ai/";
const IMAGE_API_URL = "https://image.pollinations.ai/prompt/";
const GPT_API =
  "6FE4A24ADD5AD4F4D1E4DE5AA03835EAF7DBF87FBB957AFB668A2150DAB4E6D454BAD672927800887B421552B00B78F031D3962B054CE6901B4F42074A8442B83B4F8632247B37012325D22FA6A1102B4DBA03AEE07F12D1327C56F2D88A84A8C75E888E0898139CE7E3200DD70E37EB1457908B96905FE7817EDCA5D63F2AA9F004B337AF54D654C54EEAA94D82CD9CDEA1355941632139CA7D73376734AF59659FCBF685C6146611183F2A81B8269D4B866D1C4C32738C0EE21E41E494839FA85B9461C49454637DE1A814F36C0C042185C4497109B5F118290097A7C0831C842210097324BEF08DEF9ABAFF68EED946059E7E188E776C992974120D28DE7218BCBECDB272F2A2A757FA4DC0C929AD0F2A49A66968C4CAD05302DA244024F4C775BEC4CF9303900ABFD147402935FCD860B16CE3AB81766376C9C6D66C501CF259034AA2DB91A1FD6BF9247BDDB210971475895FF491A33ED253808962CC71B834E68DF0C9773F218CD7555A3B9DEC47EF6D9E753C594FA7804C213D03F22A35F54B6443C5F2113C0B2576187ED81494916F674EA01EB828BF15B90CF4E89738B0A9A7B18AC73B3D2F9DE3FBB525EE53FA3E7210E989DEBB11EAC8F0A14FD9BDB4E1229B8495441FE9C2F6DFEF7C3E044FE336ED2EEFC95E281D4E15DF0B3DF07944096539636604EB6FC07C25B25CD409B14CD1C3E724F767E1AF766D4343938AB07804D57041608DB9D52F61EB314E813B2068F455FDAB7B15F2D25EC07CB2AAF1E434B76CB3EECA7E2460528CC59EECAFEE93AA2EB4A883F20788AF763F7DC66365C6A8A9D5A1438AEAEDFA91D0E8ED980467977728B0094E157799A0C82EA598F9F225D865C2D80A5BE16391F30625BAA53A65E5082F17350475F57341F38504C69CA388B92891EDC62380ADA9217DF45125AD80959B374DC53F4528259E6F49C2F8A922E64002607ECC9EB4A38FB29F07FBC4973607F6782842BC66B268C3FFDB2B687C5E221DC64B02393941879713D6B190610B5DA70AC4E565C9F1B39B27B4E387838039146F87382B80AB27DAECC2CFC46A6FFE998368C0A7BC7240000BC329C71E99D9FF3549896E255F27B1CE5A56C3F6AC96D14D79246C11815C6CB873F511BFD20E97973A40650D992DB523965184379493672463C49598BF425E7747BE33DFE92644A13BFCDAD58846D6744B308ED66AD605D19B7BDE3C7D2EBCD0BC212E4EE9335C4997E8EFE75B32128C7ED16C48E68EF5EFCBE70E03CF96D87BB40AA44C5103D6A55AEA9F00B0A543750EB425071A5C3098EE04EDC22CF6BFDC7709C214C04650141D274172600553F8E49B78E925C39FF2D09DDD3259849E92B370963321B642A65A81934200EEB702DC796B1BCC542E471B02CB1879161428FB5128A9FD66569BB64D1A1DA9C609FD690F5CCDBFA7A231C3E96A577ABCACB6F6F86309063C9E25DAA61900FFB403B1115962FCCA326D8F12F0E7A953486E11D206CA4DD88003A26E32998885CF7875B03764B555EF4B38845B7B0E868E3B4892814AEDC3D81688D8DA682C01E38D52D9666097C6D4110BAA1BB53984F63A1826AF38447A07306E93B4861D971833DC54148DC671A01CB5AA2F4199CAF2FDE18F13A2B5DF5D4B7D95BCF2AA34083A681D9044DA2DECB35A6392A86DDCA0107E217768D4C56DBD63AC485F60C55A48FAB212A55AC8404B86F62A66A27A010A10A944B55D278F96C9DE3F5581D402F7396F232317C2515DD50A841F79782D429FA7EAF5CC6B72A5E6EB0C311F94D33D7FCE2DC3277694FB42BB19A25A3511D15F16287C2F578E8587EF6BDB4608990BAB71DB1CE05E598AEEC0800EC471C9B7D2EC45E9CBBBBD900E3800FEE7DF61BE8D74DD4514B6585A0EC9EEC1E86CCE304F709C8EB344A3C6C5F46B5E79A8BF18F4E88F69EFB8F3797E872B7181758E7F9BBBDEE49DD02D54587AFC00F87DAAB15232B273576391185308FBFEAE053F1F89A87CC98A061159094031529D0A4641CDEF1C0A681F411CB5826A413BCD18D5F531A83FA72E27614BE1180FC032F3406E34F2DF2C3B1159A9DBF9478F37796446BA0B8A93DBACF4AC6DE65CB273F3BA61789BCE89902270EF9773F6DE455E14E2E4D6CD0DB472001009F1477FBCB6F603A5ADB9A3ACA3E7CF119DA167A8D702F5B35866C8A3C69C45715802FB54F8B33D93E7396A157B56E112E9AE773CAEFB3E37210FBB942EC099FED12560F05CDC01816F4D250700DC8808D7C944FBAA547A9D5E421F01765D37C4B2B4C322CD861EE4B3A35BE2C57F5E503863ED743C14470E17524FDC2108893C1D9828FAB8D7C3296344D55503620E6E74A958AE3FA9F0DB093374ED61C400CDD5EF18C4BAEB4B80F456CE5F5CCB23E03925ABCE49D444BFF1975AC77B21061DAD0557E5184E0596B5FA8AEB1AFAE77A14C588E9B0084D73FEF8441BFE3495C228E075675635AAAC8F5195847B20BB5D228F08131B7A5AF515197B8EC7EDD5F3CF7E9E0505607AC855D59365D18E82909D6DA1DF21F619964ACF26098DBCE71FB8EC22EEB6E29F5E6888B91D42E3D49D149D77258ED92C0844D681EB56A2EF39D62B9004024AB3BE1A19BF9E3D4B353328BEA153BE7F592E34C3AA0A9B283537A63E8509CEC547A39F886A7263172243BD6DAB213001AD60633DD34AB8BECBBC416CF730FB8C118AFDE0780A1903F88332F73D03D40C2A91A86ABDD5015F82B6F7A231800FEEE04ECD1097869B5F45EB0BB04724C2ED90B578E0789F4459D39274CAA81A53C5FF016017875FDEAD95CE363DE8952B2A2BFDC4C5E3D4A133B7E510C20D4422010C45472619B48173F0EA4C2EB4D46A343836ADBBA40329D7B167B14818C8FB4722055F39BC530EE3936F63541401257FBD239E9FE75E20849DE32E178CEE844C119CAEA0983DB3C41FD2F7D6487E19CCC80CBEEC12542AEA3FFCBE2E2CBE40F77F6CC44DCAECC22ED8C337B8F70A9CEAE42A1812341A34F80FAD45C1DC20F44AF8D314B190975AF835BE3C0F056E8DA46BB7F1CC1FD7BD31633CDBB7F95D22306A99ED803128A8E666EEDED5A3D30166BF7270653AF734F9265DC0215A723D4AFD8F46009D7A46FB05BD2461262598DCEF7910FD117674E6FD33BCCFFE470D508A8F17AFC86280D6D5A7F6A9244462D85B856F3B230EA1A0C7C4CC83B0003055016A5EE200AF4099E625F5A2B3432DC165E497EA23818C3D7D778AFB0C5F5954D497658CC55EADBB52353179AA07D6B8708142B292E0AE2FC619B571B73603AE07C51702E97A2DFB565C5199CEC9A2ACEEEE28E0145CAA28191E7337408EA5D42D3412B325B7F9E9C33168A4A785F440D6C6405CFE9F7635636D44AFD5558FBF5BD17B855F190596FA3328928EC9F818E38C82288E64FD62EAA41DBFD1C7DF1D94FC1BF053A18E18B90E947F19BEF7FA6603BA08FA8CCB51712E416520E84187A193424500F43B6A1C73776ACE94456B4B92312514B094DECB3C9957EB22F26E9281029CA47A6AE8379EC79018E8F7D726EADAA4101CC78330FC3AC6CA9A6744F0F8350CA6939BA7C9E40D56ABAAE35A6219296289BAFD63C1855A55EAA0B154F018CB2B4D5CEE84A9B024C93438EF89C11820D0628FACB84339A11D06093096F47C8E86D9236B92AC821911612CBEC5F872A887679B20687E367C51A9CCDE6698F38424F94DF26456ADEE442025C9B1E5F29024E54AD3966AA9558712007D9DE5D1F9D89349EB4F5B318B2386511D5F54916C6CE7000D6C0B160AE7D345C046423989692F318A8569CB21DE2991A2372D983FD1B416C8B8EAD97C4622B2DFEB90D8DBDEEB0BDD8A08A96CBE102A82E3960DA6AE6DA7E3972185C96706A276C5EBC66959290CE5F254AF99D9F0B2F758A7A0E583C38562C5D1A8CF1431141CFB38E949C9178DED20BD05857310D602584BEEEFC67CD41597A4158D7C3636108228513A5CC8F77533D209E294DB6FE5E48AA754219CED01947AE62C91607459064E41076ADC5F267BAB77AC808359344D463C9D0853D334E39E7F971D6D645B9FC6BB3886FA9FA8D7438CF4A36547E2051B157E6EC57C8C87FF21048BBE049FFA4FF28A54C4FC10297CDFCC2E1C908EE0077C916B804D8828D7CC598590D5F6EE860F57B0FD447857E15DACFD153B7B87B46E8C47E3875B090033A5D6087D1978DB5846E1C8FEA98DE507C882972B45961A24661E685360FC9E4CCDD726B52B215DADC980C1C49A26F0E413A5CC1BA4ABC790C0FA20A673B864280C460497DD6B5FEAC5D5F58CB3A6B39075B58AD7D9899DE9A0CA5C3804050C3C7460E0E104956049FF17B64FAFBB94C8881FD960F12474E54282F1385D12CDB1DBB18ADEA96991127AE1EECC2AEB75FEE987C06857D0C500D896F0B4B4C3A82ECE4752E58207367F961F6D92004C4F40BB725E38C1789B5B065E825B3B14F35E2E0D0ECB358E51048E4E9DD77AC06FF07549F2836C905E2615761C276D84ED88756D6BCBD5A52BB2CB1B715C35C20CF65D967B5CA09D69496483B434E86606B7AF6F90512AE5B66CD5DD8CA440133207BB3BF28B379B10443B7CEFC46C0D647220A3F9A75B8DDFD25FAC7F917AB0BF1E5714625F0BDB4D008E63914D7DD18BBD60DF823C50287DF095B46D751D97F0C349D6AB399945CB905A2FF8D8C1B7BE53B963F3EA592F8B847E27FEBBB53A1331999405A7D8995071BEB5EB1C6C63DFF1F00665C37BD05641EA1DEF317ABAF020774363DD04F27D1B2886BAC9C9A2346B02BDFF85C5E0A6FE5DA7C9FF73ADC0830C45E9C36B5CBD74E01A6936EF0BE7D89D225547FE5CFC09EB24E173A9B1FD7E28FEDE4A7A03B28971022B672FF5F10F8C9A35E71EF5B891C2A6D8C6EF82768CBD1F60B552B66E05ADE566C0623C48C73967C0CB93F456A56844725D737DEB29191A964B1DA1A620F0BEC4E4A89DA5810E754902D990ADE822295AF2B95FE1D18BCAE6205D1B6261F892BF86EAE9BB6766F71EF03C78A199D07ADFF8DC83A7F29319F79F3D34C112A6588900F399BFF153D8E50AE9D8ED2A83A745A9AB4F4E75C1E78586358E7E25A314B27DC36D03FA098E904622BB418D15D8D4B0DCD8406F35FDC574C1B8C220021034F392D06C24519B8C962B3936785BE80D5B4F8477E07CAE650CD4A01B634337B0EA4484D992FE2DADFDD361CDD17333E3CEFCE13F24DDB5C17B4FFDCE724881E2EB24BFDAC39ACA3711D28B649B85C4B8093AE3075F5C4305E55491BB41AF2EC6C08D0BD3AAEF39F4D1A72B4B43E211ED09DC69EA7B505D7BCAD4B3BE872DD25B793DFDE02E2C07D3DC614225C37B12617D1A58D8D4F4F2B7FF48B268C4C7E8E53F5AF27C216E293FE90261FB334A0E527A40A0572CFEEFFAD937D9DB199CC599A3D28FAEBDA03CA3D5AE5D12DD8583766723C08AA97DBC7C0D7856FCAC7E285312A89A004BA3CD76106A91EAA238CE03774EB05D2288A300CC7CB068816E6C6BE8DBBB93BE3D67014B4AC8D26A734EBFC601203572E0FAF839A326B041CFB651432F3C8B1E0556D4E5AF64AB7B4E0B688B8BCBE53DF2C5AFABAFD536A6499E3C7C787C664FC77C5755CFBD226093E13918EB0CE282D008D5A62C0B6CF3047FC9DFDDDF123BCE2940E90336CEA201E9AF3837187D28444967190A28B6002434BDFACB2746D4E68F582B4B81A489689E96CA0E71A439A62702076C8B4FB78B7D3032D254BBC851DE7A1FFDE4971A7D1A0C553222944CE40AD767DE2A2694CECDDA1BF5B2AD14B86A1028B3CD38D52EF4F388EC0B0E74914A9F2F51351A866BA99F4C68FF19D3AEB0839B5F7985E6610E5EE39304CEB6FDDD7027ED9F188C1710F3F10940273CB038A1AC25F3EF77B814CFB53864687D3204D66B2AAF0F7D75C21A7D04FB908FBE3D3930541DD92E46B6E78E8085EAE673F144A70641088FC344DA99108FD4E9DB26BE3319CDD699F2E29F485C87727AB802C842F7F4AD65A93EFC768E643751A68C9AA6447BBB0759CBAB679B8FEF9074B264C2193494533A1A5A6DD96238170F903A541977039D62BAAFC2297DD6E29B74014EC91FFBC287F873A8E50325C2DBD9835B92797BA01DDE03295AD9F20B5936648D02D81EBF0EAFD4A489ED53B92F66E556B95B3BE638FEA755F229FC09CE81F5190C1F7CA3055DB25D272D539C392F6DBBA0BB52683CDFD2EF33162B9992AB0ACC85AB1C143A5E8051E3714A0BB7B71975D0ABDDB0C25BF6B62096B11F9FC2ED7A68E432F541627D3204B24F74AB0853309F515BC5D2CEC5990FE654AA13E3FDD73A5F133E9881BAD7BA797757F3E8257472F6DE1B634164282EBB603AF03E7845C37596675FAA68A6C3B26016C013AF20A7D3FCB07067040A8A374FF9C9A897BFA94839CFB6B8947920A58ABF251962802FB2BE577430C045DD1D5F2F49E35A30127574D06C4FFEB6E9D3F3527351281BAE6D2B3D7290D4DF3216A988FE0BC921C2F5DFF56D6EDAEB320B5C8A9BBA4348423CE945FF1C3B4F539E65B987AB5641B11B48CDCF0E8B82BF946CFB93423CB763309C3F3F6F4E30FA7DCB4727933CA79FD7A6D80D6E3129680C6802560DD2E9A54DAF6074B2B785AA330D6EFF53293CB0931A7B9EA852D2F4F8AC43A4F04F26F99EABFB1672CA45EA2E3C2572A723EDA3187CC5F0566753FD9EBCAD27A95827A7B5D5B588FF7B070B8886D62734A7EA2B266D3E92A2DB496CC8718B34AF404D907CC22EEADA6BBBF6FB0BCD0FB6E3CB20156C76695B438D25DDDA10F7350C6DF1B0D62E91DE6CB43B25052F75B258535ABC87CFB9E585FFD7EFA1C83B6AEA5DFB0B459EEA09C96AB5AE57B860ECB51B59AB01DD4EC808EA0EA887ACB24B1710C324AFC95AD4480BC3FF926A93AB37AFBA9E4C2A442ABCB367E2B93D741A110E5F26DBB2816CBEDBC38AA3C6E788A770CA49DB31120A5BC1DFD99BB13CCB55D36C308396B3880F8A8C4994551E4C3CD9EEC421938D4A013B48448555B92AF7CCD175764E9598632B56571E1CA4257BA716956F32E5923D2CBC0A7DA59348025652930005335981726E64DC83595918C76C74FD5732F0FCA85952404229C66D04BD7E322D8E6B663F88BCA4F4CACB668053B96F6608F5E702897F28DAF57CB146E28EA10C797B7DF8F689E790C2CF024BE64099E5ECE76FB62C747F9C1A123FC4B6F06A5F6A757FEF595BAA256626E9364684D2DDE1775173542D5F0DCD05A82EEB1F08BE64336B1C7627A7DFC5B2086F47EFEEEF757DFE93428AC10DD24124F779C4F1A087FD01167DF7C944699E1BCB70105A7C93DDCDC0A6B7EC6ABFA11D6D81EF4A84D28E919ED106FDCD7F064C33BB32EF3CE633556C1F9B98F26558C5B1DA993AF32D6B71DDDDA56778ACD53A6D2F6BA965179F9D4D89F520B4B5D8528067014E5850BA173B4A18357D88CFBBC26529246C191D499BAD495AD71C79C28951E0A3B7C7EFB78AE520CAD624C7A207A24F7184046854C77BEE89254483DA6DAC10BE066A0EE69B185382703E0C6EAB59DF172F6B3E423190E800C2E3BFA7EDA1335C5E1418BA21F7EB7C07E467A1D36296CB4F908C4C983B103E8D7623C4153A345207C3FDCF9C6EAC3F7866025C083912DCF17B33FCA2A57380E9A9FA7337AF45B7D5720133E5B2A13646DEBECAA277EFB73AA5C65A17EAA07405EBC560A5F378E00302089E2FD5EF3AE9A8B4BB4DB36A78FE6873376DD35F7349AFFA4B54E43B0E73D51BD59ED2696794753CEEA562449F1F4AB87EA3CEF6CBDDA45FCD4CAA7722A78D078F8A376CB46B52C0CD53815C0A777EA05E10D2004FDE474B2C3F91A1B5A51E0485F099271A9E6F717F5D356898D06869F968661BAFA53291365C7923F81AF83769798307BC171512A5DAEB166EBE3B1CC067A2E462BC8494B807F974D2D31FCE8C342541B145D34DC7B536DAC85433CD0D20E430C586D93DF6C73FC61CC384445E7E333FCFF0307B4776539C4221F78FA127D7D165E9B586B24B9ECCB45652C0518C2C6CF16D444EEE70312D36346697F2A5EC3CC42D91F6D452091ABD7D3F98830076444E94CA634EE2945E3B911DC9CB2A3643DABF6B656082149E1B4C21275A3A699B0E270DA0253F3D8EC8FEE008BD6CA696926D622D4DF5A1A9240054138F09DC49E4034347EB894B1FF70D6287B1F9796F966D400A0C891C3D5427E0FE36F06CD4E8A12A40033B7DD8F74D6CF85A1EEEAACB1E163BA3F436B12BD21CA4CC751B2296B1B0E753A5DDB9C0BDDC5766A063C2802CAC9CB1F3460194528E40A1A1908B7AA5A94BD693E538F133F2507864CA1C73E8939C4EDEE7C0B12FC619FAF1F30B2732B816C661571075164AB1893E2DAB9EC161FC8910331B227CAFF481C9C3FE59F34EAE6433985657D912677676B3D3967D528C64F01E1525326F13473384F9CBE0D7DB00051C24BBB8581E6CD16C6D53279744A6185A6BFCF828322101B3388D65F9035E82AA15B98FC67052732E7C53FF13415AC1590779F59B88F1B522568A7E59A2E6B72A5915EE3F58EE6795AD35641AE0BB73A657B769A2DA8DF1141BEA078A12A9913268E9D21F9B5C6B91AD9CEE41F5E9C9E764D570FF49872673C5AD347A6963C9BCF163CF031051ABE92AF5B21B427EF37C41997EF678DD4E22CDAD88820BB1DF5E48D9BCC00403A81829A299AE569CCFA51865EA9596CBAADF64D9BFDD34A01F6DE5DBFF32E140391DA35EB91E9BB3565DA061143629D3E10527334BDD17956FEAB20D29A916D2554757B7DD2244B52EAB4F956EB10E67D34B18B32A397B1D799D44E8CB1F460F36369BDD47ED24E51BFDD7E5F0D3F6582587DF6516BCDA4E48223601A8039E83B3726F6D50B50E62AE7BFD106B4D47AECF0197F0779C5B333771B6E203CBFD48A43033E02266EE0DC87C726478EC49BC68DF61B8B445668F942C36F48762B41D4F4036B95C6F165D1C49681C4458A9F47F08BA72D4D0CAD952A1A029984FA01DD73466A10042A42865401A0009CEA7708A27E74BD66526E8290167AD55A4703B75A80E7D7B9B8C71886088F199686C7C240206695BA2113CD80FBF3CABF68950C7A8060C8D9FF4DC07E72C046CF37F68CF45E051CCE256C2A10615124A8923E870D4F928E26B36F97D399BA77B60C460ADDB66FEAE3C5FDE4D3E7DFB0084ED77C7EBB8B81F27FC74B85A7A46703E85BCF5371A50679C6A4802165AA6B1DF8C2C748C3EFC205DEF9A8C792D2BFA2932B904C7BB84A66BFB550034A534C8F5971DFA0C17BEC0160016139762965D0B862B298872632E2A735518213F0ED0D1DA5D41BB5052F6235F40A6863B8E6225D1FF42D950B9C181EAE8E5F6BD9908D4BB396863C26BA87C7DF69D5934FC1D39DDB0A21B2A0C1D21AE130E7C8855D6A9B4EDF324532EDAC7BFEC4B664F61756AB5C3A73FDE2B8FE6623D50B1A2E50D1B175A9417A27126F41E60ACDDD3AFBFC9C2D0096C01C4A8ED9F49D3788178507A91BB59921DCCE61D3F4A0A0419D552FAE189B8F6BABC5102FB6DEC4979F8DC9711FD4C22AF89D104FE533E40C18BA9B7908D296375F7719BC94B91F61B4D41F6812F1484F500E584F47B9665A790B362DF4DC8D0B22B3105E7667407E4DE07AE3C9CBCBCE7DFB36E426165517F9FA22B313898B75062BB498321FBC13A60493D2CAB64B36AD4296679B5F0B396A620D68463157A42416654DB21BA55DCB758F7F2A99B3A974727EE9B82CF2C1D56AA96680F1DDAD58496D9BFF8D64BD3F50312D92643588D6662B72DE644BB6CCDBD6F6DE4F0E1A826551ED30283A34657C543FFD82563858AD357A7644E93DA45F30630C40E076BA32DCB3E2EDD4884E4C0BFF5D09014A153CAEB0FCE6679C6B5EA4D914F3DA7C687B60DC70F9FE53A51FAE591372AC89122067BD57DA76AD7C7EAF2CD002C5E880C19FDC4F7F67295D04089DB65F43FC00BC6336A2B655B1F3ED17DA37A009B9E7CEBE6D2DECD44B81A4D4021F7F5ABD27FD46697FED921ECE3AD429CDF704FD48163FAACBC5574FB63E3D0B7362C5490192FC133E3CF3A93218AE26A3BEC03F68F087EE9E72640E957B00FD3209341D4C470A5BEC84C65F0BCE9FC33CF77232533865775CF506A4862FCD691A2888714B5DA582E0E362399CB4088C14B927FC54B0E7647A79CA67C7E606010A43BF9EA3B41D8E3ABEEC28AC5FB4C37A88794F048ED34FEFACC0BA98B6C7DEAA19ED3B234FA99649A3AA48B47F3D338D91B2CBCCC0FAB3C9DDE66BC32ABA4D466B74AB1FE0627AD2856206B99041F9F60CFB818A7B962635B430792518BABAA1917D6C153E70FE5BA24AEF7D3407A5246A55C7EC3552E2FBE8FE44240E0F87DF4ECC7FA564FAA9CFAB94F14320358E041D7FD3B7169F3C6261828033D453997BCFBC3D35E80852135D147D5510DA5E6848050207268D0C7A0B5B6A9D9DB756648B1C5817A7BAD463EAFD092AFEDD251F6E558B77542D35663A5A23E5E39E6C3B43C67C5363D47A39B3473F51E9A7B99241D9A28AE24EFD0112F8203D0519CE550EDB80CC52C08EFBAAD93E7F082A391";

let chatHistory = [];

const modelConfigs = {
  openai: { name: "OpenAI GPT-4o-mini", censored: true },
  "openai-large": { name: "OpenAI GPT-4o", censored: true },
  "qwen-coder": { name: "Qwen 2.5 Coder 32B", censored: true },
  llama: { name: "Llama 3.3 70B", censored: false },
  mistral: { name: "Mistral Nemo", censored: false },
  unity: { name: "Unity with Mistral Large", censored: false },
  midijourney: { name: "Midijourney musical transformer", censored: true },
  rtist: { name: "Rtist image generator", censored: true },
  searchgpt: { name: "SearchGPT with realtime news", censored: true },
  evil: { name: "Evil Mode - Experimental", censored: false },
  deepseek: { name: "DeepSeek-V3", censored: true },
  "claude-hybridspace": { name: "Claude Hybridspace", censored: true },
  "deepseek-r1": { name: "DeepSeek-R1 Distill Qwen 32B", censored: true },
  "deepseek-reasoner": { name: "DeepSeek R1 - Full", censored: true },
  llamalight: { name: "Llama 3.1 8B Instruct", censored: false },
  llamaguard: { name: "Llamaguard 7B AWQ", censored: false },
  gemini: { name: "Gemini 2.0 Flash", censored: true },
  "gemini-thinking": { name: "Gemini 2.0 Flash Thinking", censored: true },
  hormoz: { name: "Hormoz 8b", censored: false },
  flux: { name: "Flux Neural Engine", censored: true },
  turbo: { name: "Turbo Generation", censored: true },
};

const QUALITY_PRESETS = {
  draft: { name: "Draft", steps: 20, cfg: 7 },
  normal: { name: "Normal", steps: 30, cfg: 7.5 },
  high: { name: "High Quality", steps: 40, cfg: 8 },
  max: { name: "Maximum", steps: 50, cfg: 8.5 },
};

const STYLE_MODIFIERS = {
  enhance: "highly detailed, professional, award winning",
  sharp: "sharp focus, 8k uhd, high resolution",
  dramatic: "dramatic lighting, cinematic, professional photography",
  artistic: "artistic, professional, masterpiece",
  realistic: "photorealistic, hyperrealistic, ultrarealistic",
};

const THEMES = {
  oled: {
    name: "OLED",
    backgroundClasses: ["bg-black"],
    textClass: "text-white",
    cardClasses: ["from-black", "to-gray-900/20"],
    inputClasses: ["bg-gray-900/10", "border-white/5"],
    accent: "purple",
  },
  dark: {
    name: "Dark",
    backgroundClasses: [
      "bg-gradient-to-br",
      "from-gray-900",
      "via-gray-800",
      "to-black",
    ],
    textClass: "text-white",
    cardClasses: ["from-gray-800/50", "to-gray-900/50"],
    inputClasses: ["bg-black/30", "border-white/5"],
    accent: "purple",
  },
  cyberpunk: {
    name: "Cyberpunk",
    backgroundClasses: [
      "bg-gradient-to-br",
      "from-purple-900",
      "via-pink-800",
      "to-black",
    ],
    textClass: "text-pink-50",
    cardClasses: ["from-purple-800/50", "to-pink-900/50"],
    inputClasses: ["bg-purple-900/30", "border-pink-500/10"],
    accent: "pink",
  },
  forest: {
    name: "Forest",
    backgroundClasses: [
      "bg-gradient-to-br",
      "from-green-900",
      "via-emerald-800",
      "to-black",
    ],
    textClass: "text-emerald-50",
    cardClasses: ["from-green-800/50", "to-emerald-900/50"],
    inputClasses: ["bg-green-900/30", "border-emerald-500/10"],
    accent: "emerald",
  },
  ocean: {
    name: "Ocean",
    backgroundClasses: [
      "bg-gradient-to-br",
      "from-blue-900",
      "via-cyan-800",
      "to-black",
    ],
    textClass: "text-cyan-50",
    cardClasses: ["from-blue-800/50", "to-cyan-900/50"],
    inputClasses: ["bg-blue-900/30", "border-cyan-500/10"],
    accent: "cyan",
  },
  crimson: {
    name: "Crimson",
    backgroundClasses: [
      "bg-gradient-to-br",
      "from-red-900",
      "via-red-800",
      "to-black",
    ],
    textClass: "text-red-50",
    cardClasses: ["from-red-800/50", "to-red-900/50"],
    inputClasses: ["bg-red-900/30", "border-red-500/10"],
    accent: "red",
  },
  midnight: {
    name: "Midnight",
    backgroundClasses: [
      "bg-gradient-to-br",
      "from-violet-900",
      "via-indigo-800",
      "to-black",
    ],
    textClass: "text-violet-50",
    cardClasses: ["from-violet-800/50", "to-indigo-900/50"],
    inputClasses: ["bg-violet-900/30", "border-indigo-500/10"],
    accent: "violet",
  },
  sunset: {
    name: "Sunset",
    backgroundClasses: [
      "bg-gradient-to-br",
      "from-amber-900",
      "via-orange-800",
      "to-black",
    ],
    textClass: "text-amber-50",
    cardClasses: ["from-amber-800/50", "to-orange-900/50"],
    inputClasses: ["bg-amber-900/30", "border-orange-500/10"],
    accent: "amber",
  },
  mono: {
    name: "Mono",
    backgroundClasses: [
      "bg-gradient-to-br",
      "from-slate-900",
      "via-gray-800",
      "to-black",
    ],
    textClass: "text-gray-50",
    cardClasses: ["from-slate-800/50", "to-gray-900/50"],
    inputClasses: ["bg-slate-900/30", "border-gray-500/10"],
    accent: "gray",
  },
};

const presets = {
  cinematic: "cinematic, dramatic lighting, high detail, 8k",
  anime: "anime style, vibrant colors, detailed, studio ghibli inspired",
  portrait: "portrait, professional photography, bokeh, natural lighting",
  fantasy: "fantasy art, magical, ethereal, detailed environment",
  abstract: "abstract art, contemporary, vibrant colors, geometric",
  minimalist: "minimalist, clean lines, simple composition, elegant",
  neon: "neon lighting, cyberpunk, futuristic, vibrant colors",
  vintage: "vintage style, retro aesthetic, nostalgic, film grain",
  nature: "nature photography, golden hour, serene, detailed landscape",
};

const promptInput = document.getElementById("promptInput");
const enhanceBtn = document.getElementById("enhanceBtn");
const generateBtn = document.getElementById("generateBtn");
const chatHistoryDiv = document.getElementById("chatHistory");
const imageResults = document.getElementById("imageResults");
const modelSelect = document.getElementById("modelSelect");
const imageCountSelect = document.getElementById("imageCountSelect");

enhanceBtn.addEventListener("click", enhancePrompt);
generateBtn.addEventListener("click", generateImages);

async function enhancePrompt() {
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  enhanceBtn.disabled = true;
  const enhanceSpinner = enhanceBtn.querySelector(".spinner");
  const enhanceIcon = enhanceBtn.querySelector(".enhance-icon");
  enhanceSpinner.classList.remove("hidden");
  enhanceIcon.classList.add("hidden");

  try {
    const messages = [
      {
        role: "system",
        content:
          "You are a prompt engineering expert specializing in creating detailed, artistic image generation prompts. Your role is to enhance prompts by adding artistic style, mood, lighting, composition, and technical details. Keep responses concise and focused on the enhanced prompt only.",
      },
      {
        role: "user",
        content: `Enhance this image prompt with artistic details and technical specifications: ${prompt}`,
      },
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        model: "openai",
        seed: Math.floor(Math.random() * 1000),
        jsonMode: false,
      }),
    });

    const enhancedPrompt = await response.text();

    chatHistory.push({
      role: "user",
      content: prompt,
    });
    chatHistory.push({
      role: "assistant",
      content: enhancedPrompt,
    });

    displayChatMessage(prompt, enhancedPrompt);
    promptInput.value = enhancedPrompt;
    chatHistoryDiv.classList.add("show");
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to enhance prompt. Please try again.");
  } finally {
    enhanceBtn.disabled = false;
    enhanceSpinner.classList.add("hidden");
    enhanceIcon.classList.remove("hidden");
  }
}

function displayChatMessage(original, enhanced) {
  const messageDiv = document.createElement("div");
  messageDiv.className =
    "bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50";
  messageDiv.innerHTML = `
    <div class="text-gray-400 mb-2">Original: ${original}</div>
    <div class="text-green-400">Enhanced: ${enhanced}</div>
  `;
  chatHistoryDiv.appendChild(messageDiv);
}

async function generateImages() {
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  const generateSpinner = generateBtn.querySelector(".spinner");
  const generateIcon = generateBtn.querySelector(".generate-icon");
  generateSpinner.classList.remove("hidden");
  generateIcon.classList.add("hidden");
  generateBtn.disabled = true;

  // Clear previous results
  imageResults.innerHTML = "";
  imageResults.classList.remove("show");
  imageResults.classList.remove("hidden");

  // Force a reflow to ensure the animation plays
  void imageResults.offsetWidth;

  imageResults.classList.add("show");

  const selectedModel = modelSelect.value;
  const imageCount = parseInt(imageCountSelect.value);
  const modelConfig = modelConfigs[selectedModel];

  const imagePromises = [];

  for (let i = 0; i < imageCount; i++) {
    const imageContainer = createImageContainer(i);
    imageResults.appendChild(imageContainer);

    const promise = generateSingleImage(prompt, imageContainer, modelConfig);
    imagePromises.push(promise);
  }

  try {
    await Promise.all(imagePromises);
  } catch (error) {
    console.error("Error generating images:", error);
  } finally {
    generateBtn.disabled = false;
    generateSpinner.classList.add("hidden");
    generateIcon.classList.remove("hidden");
  }

  // Smooth scroll to results
  setTimeout(() => {
    imageResults.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

function createImageContainer(index) {
  const container = document.createElement("div");
  container.className =
    "relative rounded-xl overflow-hidden shadow-2xl bg-gray-800/30 group";
  container.innerHTML = `
    <div class="loading-overlay absolute inset-0 flex items-center justify-center bg-gray-800/90 backdrop-blur-sm z-10">
      <div class="flex items-center space-x-3">
        <div class="spinner"></div>
        <span class="text-lg">Generating image ${index + 1}...</span>
      </div>
    </div>
    <img class="w-full rounded-xl generated-image" src="" alt="Generated image ${index + 1}">
    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    </div>
  `;
  return container;
}

async function generateSingleImage(prompt, container, modelConfig) {
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(prompt);

  // Get advanced parameters
  const width = document.getElementById("widthInput").value;
  const height = document.getElementById("heightInput").value;
  const quality = document.getElementById("qualitySelect").value;
  const guidance = document.getElementById("guidanceInput").value;
  const steps = document.getElementById("stepsInput").value;
  const styleModifiers = Array.from(
    document.querySelectorAll('input[name="styleModifier"]:checked'),
  )
    .map((input) => STYLE_MODIFIERS[input.value])
    .join(", ");

  // Build URL with all parameters
  let imageUrl = `${IMAGE_API_URL}${encodedPrompt}${styleModifiers ? `, ${styleModifiers}` : ""}?nologo=true&seed=${seed}&model=${modelSelect.value}`;

  if (width) imageUrl += `&width=${width}`;
  if (height) imageUrl += `&height=${height}`;
  if (guidance) imageUrl += `&cfg=${guidance}`;
  if (steps) imageUrl += `&steps=${steps}`;

  try {
    const generatedImage = container.querySelector(".generated-image");
    const loadingOverlay = container.querySelector(".loading-overlay");

    generatedImage.src = imageUrl;

    await new Promise((resolve, reject) => {
      generatedImage.onload = () => {
        // Ensure the image has loaded before showing it
        setTimeout(() => {
          generatedImage.classList.add("loaded");
          loadingOverlay.style.opacity = "0";
          setTimeout(() => {
            loadingOverlay.style.display = "none";
          }, 300);
          resolve();
        }, 100);
      };
      generatedImage.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    });
  } catch (error) {
    console.error("Error loading image:", error);
    container.innerHTML =
      '<div class="p-4 text-red-400">Failed to generate image</div>';
  }
}

// Add Advanced Options Toggle
const advancedOptionsBtn = document.getElementById("advancedOptionsBtn");
const advancedOptions = document.getElementById("advancedOptions");
const advancedChevron = document.getElementById("advancedChevron");

advancedOptionsBtn.addEventListener("click", () => {
  advancedOptions.classList.toggle("hidden");
  advancedChevron.classList.toggle("rotate-90");
});

// Validate width and height inputs
const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");

function validateDimension(input) {
  let value = parseInt(input.value);
  if (value < 64) {
    value = 64;
  }
  // Round to nearest multiple of 64
  value = Math.round(value / 64) * 64;
  input.value = value || "";
}

widthInput.addEventListener("blur", () => validateDimension(widthInput));
heightInput.addEventListener("blur", () => validateDimension(heightInput));

// Auto-resize textarea
promptInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

// Keypress handling
promptInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    generateImages();
  } else if (e.key === "Enter" && e.shiftKey) {
    e.preventDefault();
    enhancePrompt();
  }
});

function setupPresets() {
  const presetsContainer = document.getElementById("presets");
  if (!presetsContainer) return; // Guard clause to prevent errors

  Object.entries(presets).forEach(([name, suffix]) => {
    const btn = document.createElement("button");
    btn.className =
      "preset-btn px-4 py-2 rounded-lg text-sm capitalize bg-black/30 hover:bg-white/10 transition-all border border-white/5";
    btn.textContent = name;
    btn.addEventListener("click", () => {
      const currentPrompt = promptInput.value.trim();
      promptInput.value = currentPrompt
        ? `${currentPrompt}, ${suffix}`
        : suffix;
      document
        .querySelectorAll(".preset-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
    presetsContainer.appendChild(btn);
  });
}

function setupAdvancedOptions() {
  const advancedContainer = document.getElementById("advancedOptions");

  // Add quality preset selector
  const qualityDiv = document.createElement("div");
  qualityDiv.className = "space-y-2";
  qualityDiv.innerHTML = `
    <label class="text-sm text-gray-400 ml-1">Quality Preset</label>
    <select id="qualitySelect" class="w-full bg-black/30 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-white/5">
      ${Object.entries(QUALITY_PRESETS)
        .map(
          ([key, preset]) => `<option value="${key}">${preset.name}</option>`,
        )
        .join("")}
    </select>
  `;

  // Add guidance scale input
  const guidanceDiv = document.createElement("div");
  guidanceDiv.className = "space-y-2";
  guidanceDiv.innerHTML = `
    <label class="text-sm text-gray-400 ml-1">Guidance Scale (7-30)</label>
    <input type="number" id="guidanceInput" min="7" max="30" step="0.5" value="7.5"
      class="w-full bg-black/30 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-white/5">
  `;

  // Add steps input
  const stepsDiv = document.createElement("div");
  stepsDiv.className = "space-y-2";
  stepsDiv.innerHTML = `
    <label class="text-sm text-gray-400 ml-1">Steps (20-150)</label>
    <input type="number" id="stepsInput" min="20" max="150" step="5" value="30"
      class="w-full bg-black/30 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-white/5">
  `;

  // Add style modifiers
  const styleDiv = document.createElement("div");
  styleDiv.className = "space-y-2 col-span-2";
  styleDiv.innerHTML = `
    <label class="text-sm text-gray-400 ml-1">Style Modifiers</label>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      ${Object.entries(STYLE_MODIFIERS)
        .map(
          ([key, value]) => `
        <label class="flex items-center space-x-2 bg-black/30 p-3 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10">
          <input type="checkbox" name="styleModifier" value="${key}" class="rounded text-purple-500 focus:ring-purple-500">
          <span class="text-sm">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
        </label>
      `,
        )
        .join("")}
    </div>
  `;

  // Append new elements to advanced options
  advancedContainer.appendChild(qualityDiv);
  advancedContainer.appendChild(guidanceDiv);
  advancedContainer.appendChild(stepsDiv);
  advancedContainer.appendChild(styleDiv);

  // Add event listeners
  document.getElementById("qualitySelect").addEventListener("change", (e) => {
    const preset = QUALITY_PRESETS[e.target.value];
    document.getElementById("stepsInput").value = preset.steps;
    document.getElementById("guidanceInput").value = preset.cfg;
  });
}

function saveToHistory(prompt, result) {
  const history = JSON.parse(localStorage.getItem("nexaHistory") || "[]");
  history.unshift({ prompt, result, timestamp: Date.now() });
  localStorage.setItem("nexaHistory", JSON.stringify(history.slice(0, 50))); // Keep last 50 items
}

function loadHistory() {
  return JSON.parse(localStorage.getItem("nexaHistory") || "[]");
}

function suggestPrompts() {
  const history = loadHistory();
  const input = promptInput.value.toLowerCase();
  if (input.length < 3) return;

  const suggestions = history
    .map((item) => item.prompt)
    .filter((prompt) => prompt.toLowerCase().includes(input))
    .slice(0, 5);

  // Show suggestions UI
  // ... (implementation details)
}

document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + / to focus prompt input
  if ((e.ctrlKey || e.metaKey) && e.key === "/") {
    e.preventDefault();
    promptInput.focus();
  }

  // Ctrl/Cmd + S to save current generation
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    // Save current generation logic
  }
});

function validatePrompt(prompt) {
  if (prompt.length < 3) return "Prompt too short";
  if (prompt.length > 500) return "Prompt too long";
  return null;
}

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "bg-red-500/20 text-red-400 px-4 py-2 rounded-lg mt-4";
  errorDiv.textContent = message;
  document.querySelector(".container").appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

function optimizeImage(container) {
  const img = container.querySelector(".generated-image");
  if (!img) return;

  // Add lazy loading
  img.loading = "lazy";

  // Add progressive loading
  img.decoding = "async";

  // Add error handling
  img.onerror = () => {
    container.innerHTML =
      '<div class="p-4 text-red-400">Failed to load image</div>';
  };
}

function openSettings() {
  const modal = document.getElementById("settingsModal");
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.add("show"), 10);
}

function closeSettings() {
  const modal = document.getElementById("settingsModal");
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("hidden"), 300);
}

function applyTheme(themeKey) {
  const theme = THEMES[themeKey];
  const body = document.body;

  // Remove all existing theme classes
  Object.values(THEMES).forEach((t) => {
    t.backgroundClasses.forEach((className) => {
      body.classList.remove(className);
    });
    body.classList.remove(t.textClass);
  });

  // Apply new theme classes
  theme.backgroundClasses.forEach((className) => {
    body.classList.add(className);
  });
  body.classList.add(theme.textClass);

  // Save theme preference
  localStorage.setItem("nexaTheme", themeKey);

  // Update active state on theme buttons
  document.querySelectorAll(".theme-option").forEach((btn) => {
    btn.classList.toggle("ring-2", btn.dataset.theme === themeKey);
  });
}

function loadSettings() {
  // Load saved theme or use OLED as default
  const savedTheme = localStorage.getItem("nexaTheme") || "oled";
  applyTheme(savedTheme);
  const themeButton = document.querySelector(`[data-theme="${savedTheme}"]`);
  if (themeButton) {
    themeButton.classList.add("ring-2");
  }

  // Load other settings
  const settings = JSON.parse(localStorage.getItem("nexaSettings") || "{}");

  // Set default values if not present
  settings.showShortcuts = settings.showShortcuts ?? true;
  settings.showTooltips = settings.showTooltips ?? true;
  settings.useAnimations = settings.useAnimations ?? true;

  // Apply settings to DOM
  document.getElementById("showShortcuts").checked = settings.showShortcuts;
  document.getElementById("showTooltips").checked = settings.showTooltips;
  document.getElementById("useAnimations").checked = settings.useAnimations;

  applySettings(settings);
}

function saveSettings() {
  const settings = {
    showShortcuts: document.getElementById("showShortcuts").checked,
    showTooltips: document.getElementById("showTooltips").checked,
    useAnimations: document.getElementById("useAnimations").checked,
  };

  localStorage.setItem("nexaSettings", JSON.stringify(settings));
  applySettings(settings);
}

function applySettings(settings) {
  // Apply shortcuts visibility
  document.querySelectorAll(".keyboard-shortcut").forEach((el) => {
    el.style.display = settings.showShortcuts ? "inline-flex" : "none";
  });

  // Apply tooltips
  document.querySelectorAll("[data-tooltip]").forEach((el) => {
    el.classList.toggle("tooltip", settings.showTooltips);
  });

  // Apply animations
  document.body.classList.toggle("reduce-motion", !settings.useAnimations);
}

document.addEventListener("DOMContentLoaded", () => {
  setupPresets();
  setupAdvancedOptions();
  promptInput.addEventListener("input", suggestPrompts);

  // Add tooltip initialization
  const tooltips = document.querySelectorAll("[data-tooltip]");
  tooltips.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      const tooltip = document.createElement("div");
      tooltip.className =
        "absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-xs whitespace-nowrap";
      tooltip.textContent = el.dataset.tooltip;
      el.appendChild(tooltip);
    });

    el.addEventListener("mouseleave", () => {
      const tooltip = el.querySelector(".absolute");
      if (tooltip) tooltip.remove();
    });
  });

  // Add keyboard shortcuts info
  const shortcutsDiv = document.createElement("div");
  shortcutsDiv.className = "mt-4 text-sm text-gray-400";
  shortcutsDiv.innerHTML = `
    <div class="flex items-center justify-center space-x-4">
      <span>Press <kbd class="px-2 py-1 bg-white/10 rounded">Tab</kbd> to cycle through options</span>
      <span>Press <kbd class="px-2 py-1 bg-white/10 rounded">Ctrl</kbd> + <kbd class="px-2 py-1 bg-white/10 rounded">/</kbd> to focus prompt</span>
    </div>
  `;
  document.querySelector(".container").appendChild(shortcutsDiv);

  loadSettings();

  // Add settings button event listener
  document
    .getElementById("settingsBtn")
    .addEventListener("click", openSettings);
  document
    .getElementById("closeSettings")
    .addEventListener("click", closeSettings);

  // Add theme selection listeners
  document.querySelectorAll(".theme-option").forEach((option) => {
    option.addEventListener("click", () => {
      document
        .querySelectorAll(".theme-option")
        .forEach((opt) => opt.classList.remove("ring-2"));
      option.classList.add("ring-2");
      applyTheme(option.dataset.theme);
    });
  });

  // Add settings change listeners
  document.querySelectorAll(".setting-toggle").forEach((toggle) => {
    toggle.addEventListener("change", saveSettings);
  });
});

function populateModelSelect() {
  const modelSelect = document.getElementById("modelSelect");
  modelSelect.innerHTML = ""; // Clear existing options

  Object.entries(modelConfigs).forEach(([key, config]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = config.name;
    if (config.censored) {
      option.classList.add("censored");
    }
    modelSelect.appendChild(option);
  });
}

// Call this function when the page loads
document.addEventListener("DOMContentLoaded", populateModelSelect);
