import React from "react";
import SafariItem from "./SafariItem";

const safariData = [
  {
    title: "1. Serengeti National Park Safari",
    description:
      "The Serengeti is famous for its vast savannahs, abundant wildlife, and the Great Migration, where millions of wildebeest, zebras, and gazelles cross the plains in search of greener pastures. This park offers excellent opportunities to see the Big Five (lion, leopard, elephant, buffalo, and rhino) as well as cheetahs, hyenas, and various bird species. Safaris here can be enjoyed as game drives, hot air balloon safaris, or even walking safaris in select areas.",
  },
  {
    title: "2. Ngorongoro Crater Safari",
    description:
      "A UNESCO World Heritage Site, Ngorongoro Crater is a breathtaking natural wonder with one of the highest concentrations of wildlife in Africa. The crater floor is home to lions, elephants, hippos, flamingos, and the endangered black rhino. This is one of the best places to experience a safari with guaranteed wildlife sightings in a stunning setting.",
  },
  {
    title: "3. Tarangire National Park Safari",
    description:
      "Known for its large elephant herds and ancient baobab trees, Tarangire National Park is a great choice for those looking to experience a diverse range of wildlife away from the crowds. The park also boasts a high density of predators, including lions and leopards, as well as over 500 bird species.",
  },
  {
    title: "4. Lake Manyara National Park Safari",
    description:
      "Lake Manyara is famous for its tree-climbing lions, large troops of baboons, and a vibrant birdlife that includes thousands of flamingos along the lake. The park’s varied landscapes range from groundwater forests to open savannah, making it a great destination for a short yet diverse safari.",
  },
  {
    title: "5. Selous Game Reserve Safari (Now Nyerere National Park)",
    description:
      "As one of Africa’s largest game reserves, Selous (Nyerere) offers a remote and uncrowded safari experience. Visitors can enjoy boat safaris along the Rufiji River, walking safaris, and classic game drives. The reserve is home to elephants, crocodiles, hippos, and a variety of big cats.",
  },
  {
    title: "6. Ruaha National Park Safari",
    description:
      "For those looking for an off-the-beaten-path safari, Ruaha is an excellent choice. It is Tanzania’s largest national park and hosts a high concentration of lions, as well as large herds of elephants, giraffes, and African wild dogs. The park’s remote location ensures a quieter and more intimate safari experience.",
  },
  {
    title: "7. Mikumi National Park Safari",
    description:
      "Often considered a smaller version of the Serengeti, Mikumi National Park is an ideal option for travelers who want a short yet rewarding safari experience, especially for those coming from Dar es Salaam or Zanzibar. The park is home to elephants, zebras, wildebeest, and lions.",
  },
  {
    title: "8. Mahale Mountains & Gombe Stream National Park Safari",
    description:
      "For an extraordinary safari experience, Mahale Mountains and Gombe Stream National Park offer chimpanzee trekking safaris. These parks, located along the shores of Lake Tanganyika, provide a unique opportunity to observe wild chimpanzees in their natural habitat.",
  },
  {
    title: "9. Katavi National Park Safari",
    description:
      "One of Tanzania’s most untouched and least visited parks, Katavi offers a true wilderness experience. It is home to large herds of buffalo, hippos, crocodiles, and impressive predator activity. This is the perfect destination for adventurous travelers seeking a remote safari.",
  },
  {
    title: "10. Saadani National Park Safari",
    description:
      "Saadani is the only national park in Tanzania where the bush meets the beach. Visitors can experience a mix of wildlife and coastal scenery, with opportunities to see elephants, lions, and even marine life such as dolphins.",
  },
];

const SafariList = () => (
  <div className="safaris-items">
    {safariData.map((item, index) => (
      <SafariItem key={index} title={item.title} description={item.description} />
    ))}
  </div>
);

export default SafariList;