import CardNav from './Card_nav'


export default function Navbar() {
  const items = [
    {
      label: "About",
      bgColor: "#1B1722",
      textColor: "#fff",
      links: [
        { label: "Company", ariaLabel: "About Company", href: "#" },
        { label: "Careers", ariaLabel: "About Careers", href: "#" }
      ]
    },
    {
      label: "Contact",
      bgColor: "#2F293A", 
      textColor: "#fff",
      links: [
        { label: "Email", ariaLabel: "Email us", href: "#" },
        { label: "Twitter", ariaLabel: "Twitter", href: "#" },
        { label: "LinkedIn", ariaLabel: "LinkedIn", href: "#" }
      ]
    },
    {
      label: "Registro",
      bgColor: "#2F293A", 
      textColor: "#fff",
      links: [
        { label: "Registrate", ariaLabel: "aqui", href: "../../../register" }
      ]
    }
  ];

  return (
    <CardNav
      items={items}
      baseColor="#fff"
      menuColor="#000"
      buttonBgColor="#111"
      buttonTextColor="#fff"
      ease="power3.out"
/>
  );
}