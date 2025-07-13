import { useMemo } from "react";

const removeTrailingZeros = (num: string) => {
  if (num.includes(".")) {
    return num.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }
  return num;
};

export const Tonnage = ({ tonnage }: { tonnage?: number }) => {
  const s = useMemo(() => {
    if (tonnage !== undefined) {
      // display million tonnages with 6 decimal places
      return removeTrailingZeros(tonnage.toFixed(6));
    }
    return "";
  }, [tonnage]);

  return <span title={tonnage?.toString()}>{s}</span>;
};

export const Grade = ({ grade }: { grade?: number }) => {
  const s = useMemo(() => {
    if (grade !== undefined) {
      // display percent grade with 4 decimal places
      return removeTrailingZeros(grade.toFixed(4));
    }
    return "";
  }, [grade]);

  return <span title={grade?.toString()}>{s}</span>;
};

export const ContainedMetal = ({ tonnage, grade }: { tonnage?: number; grade?: number }) => {
  const [containedMetal, containedMetalDisplay] = useMemo(() => {
    if (tonnage !== undefined && grade !== undefined) {
      // calculate contained metal in tonnes (grade is in percent, tonnages in million tonnes)
      const containedMetal = tonnage * grade * 10000;
      return [containedMetal.toString(), removeTrailingZeros(containedMetal.toFixed(1)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")];
    }
    return ["", ""];
  }, [tonnage, grade]);

  return <span title={containedMetal}>{containedMetalDisplay}</span>;
};

export const Empty = () => <></>;

export const MayEmptyString = ({ value }: { value?: string }) => {
  if (value !== undefined) {
    return <span>{value}</span>;
  }
  return <></>;
};
