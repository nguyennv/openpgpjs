import { expect } from 'chai';

import { brainpoolP256r1 } from '../../src/crypto/public_key/elliptic/brainpool/brainpoolP256r1';
import { brainpoolP384r1 } from '../../src/crypto/public_key/elliptic/brainpool/brainpoolP384r1';
import { brainpoolP512r1 } from '../../src/crypto/public_key/elliptic/brainpool/brainpoolP512r1';
import util from '../../src/util';

const rfc7027 = [
  {
    'curve': 'brainpoolP256r1',
    'dA': '81DB1EE100150FF2EA338D708271BE38300CB54241D79950F77B063039804F1D',
    'QAx': '44106E913F92BC02A1705D9953A8414DB95E1AAA49E81D9E85F929A8E3100BE5',
    'QAy': '8AB4846F11CACCB73CE49CBDD120F5A900A69FD32C272223F789EF10EB089BDC',
    'dB': '55E40BC41E37E3E2AD25C3C6654511FFA8474A91A0032087593852D3E7D76BD3',
    'QBx': '8D2D688C6CF93E1160AD04CC4429117DC2C41825E1E9FCA0ADDD34E6F1B39F7B',
    'QBy': '990C57520812BE512641E47034832106BC7D3E8DD0E4C7F1136D7006547CEC6A',
    'Zx': '89AFC39D41D3B327814B80940B042590F96556EC91E6AE7939BCE31F3A18BF2B',
    'Zy': '49C27868F4ECA2179BFD7D59B1E3BF34C1DBDE61AE12931648F43E59632504DE'
  },
  {
    'curve': 'brainpoolP384r1',
    'dA': '1E20F5E048A5886F1F157C74E91BDE2B98C8B52D58E5003D57053FC4B0BD65D6F15EB5D1EE1610DF870795143627D042',
    'QAx': '68B665DD91C195800650CDD363C625F4E742E8134667B767B1B476793588F885AB698C852D4A6E77A252D6380FCAF068',
    'QAy': '55BC91A39C9EC01DEE36017B7D673A931236D2F1F5C83942D049E3FA20607493E0D038FF2FD30C2AB67D15C85F7FAA59',
    'dB': '032640BC6003C59260F7250C3DB58CE647F98E1260ACCE4ACDA3DD869F74E01F8BA5E0324309DB6A9831497ABAC96670',
    'QBx': '4D44326F269A597A5B58BBA565DA5556ED7FD9A8A9EB76C25F46DB69D19DC8CE6AD18E404B15738B2086DF37E71D1EB4',
    'QBy': '62D692136DE56CBE93BF5FA3188EF58BC8A3A0EC6C1E151A21038A42E9185329B5B275903D192F8D4E1F32FE9CC78C48',
    'Zx': '0BD9D3A7EA0B3D519D09D8E48D0785FB744A6B355E6304BC51C229FBBCE239BBADF6403715C35D4FB2A5444F575D4F42',
    'Zy': '0DF213417EBE4D8E40A5F76F66C56470C489A3478D146DECF6DF0D94BAE9E598157290F8756066975F1DB34B2324B7BD'
  },
  {
    'curve': 'brainpoolP512r1',
    'dA': '16302FF0DBBB5A8D733DAB7141C1B45ACBC8715939677F6A56850A38BD87BD59B09E80279609FF333EB9D4C061231FB26F92EEB04982A5F1D1764CAD57665422',
    'QAx': '0A420517E406AAC0ACDCE90FCD71487718D3B953EFD7FBEC5F7F27E28C6149999397E91E029E06457DB2D3E640668B392C2A7E737A7F0BF04436D11640FD09FD',
    'QAy': '72E6882E8DB28AAD36237CD25D580DB23783961C8DC52DFA2EC138AD472A0FCEF3887CF62B623B2A87DE5C588301EA3E5FC269B373B60724F5E82A6AD147FDE7',
    'dB': '230E18E1BCC88A362FA54E4EA3902009292F7F8033624FD471B5D8ACE49D12CFABBC19963DAB8E2F1EBA00BFFB29E4D72D13F2224562F405CB80503666B25429',
    'QBx': '9D45F66DE5D67E2E6DB6E93A59CE0BB48106097FF78A081DE781CDB31FCE8CCBAAEA8DD4320C4119F1E9CD437A2EAB3731FA9668AB268D871DEDA55A5473199F',
    'QBy': '2FDC313095BCDD5FB3A91636F07A959C8E86B5636A1E930E8396049CB481961D365CC11453A06C719835475B12CB52FC3C383BCE35E27EF194512B71876285FA',
    'Zx': 'A7927098655F1F9976FA50A9D566865DC530331846381C87256BAF3226244B76D36403C024D7BBF0AA0803EAFF405D3D24F11A9B5C0BEF679FE1454B21C4CD1F',
    'Zy': '7DB71C3DEF63212841C463E881BDCF055523BD368240E6C3143BD8DEF8B3B3223B95E0F53082FF5E412F4222537A43DF1C6D25729DDB51620A832BE6A26680A2'
  }
];

const hexToBigint = hex => BigInt(`0x${hex}`);

// prettier-ignore
const BRAINPOOL = {
  brainpoolP256r1,
  brainpoolP384r1,
  brainpoolP512r1
};

export default () => describe('Brainpool curves (RFC7027)', () => {
  it('Field orders', () => {
    const vectors = {
      brainpoolP256r1: BigInt('0xa9fb57dba1eea9bc3e660a909d838d726e3bf623d52620282013481d1f6e5377'),
      brainpoolP384r1: BigInt('0x8cb91e82a3386d280f5d6f7e50e641df152f7109ed5456b412b1da197fb71123acd3a729901d1a71874700133107ec53'),
      brainpoolP512r1: BigInt('0xaadd9db8dbe9c48b3fd4e6ae33c9fc07cb308db3b3c9d20ed6639cca703308717d4d9b009bc66842aecda12ae6a380e62881ff2f2d82c68528aa6056583a48f3')
    };
    for (const n of Object.keys(vectors)) { expect(BRAINPOOL[n].CURVE.Fp.ORDER).to.deep.equal(vectors[n]); }
  });

  for (const v of rfc7027) {
    it(v.curve, () => {
      const curve = BRAINPOOL[v.curve];
      const secKeyA = util.hexToUint8Array(v.dA);
      const pubKeyA = curve.getPublicKey(secKeyA);
      const pubPointA = curve.ProjectivePoint.fromHex(pubKeyA);
      expect(pubPointA.x).to.equal(hexToBigint(v.QAx));
      expect(pubPointA.y).to.equal(hexToBigint(v.QAy));
      const secKeyB = hexToBigint(v.dB);
      const pubKeyB = curve.getPublicKey(secKeyB);
      const pubPointB = curve.ProjectivePoint.fromHex(pubKeyB);
      expect(pubPointB.x).to.equal(hexToBigint(v.QBx));
      expect(pubPointB.y).to.equal(hexToBigint(v.QBy));
      const shared = curve.getSharedSecret(secKeyA, pubKeyB);
      const sharedPoint = curve.ProjectivePoint.fromHex(shared);
      expect(sharedPoint.x).to.equal(hexToBigint(v.Zx));
      expect(sharedPoint.y).to.equal(hexToBigint(v.Zy));
      expect(shared).to.deep.equal(curve.getSharedSecret(secKeyB, pubKeyA));
    });
  }
});
