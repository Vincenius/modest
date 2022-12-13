import dynamic from "next/dynamic";

const ReactRTE = dynamic(() => import("./RichtextEditor"), {
	ssr: false,
});

export default ReactRTE;